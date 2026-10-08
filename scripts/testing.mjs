#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const reads={
 projects:'select id,name,owner,data_review_due,retention_note from projects order by name',
 cases:'select c.id,p.name as project,c.title,c.priority,c.version,c.approved_by,c.refs from cases c join projects p on p.id=c.project_id order by p.name,c.title',
 runs:'select * from release_readiness order by due_on,name',
 results:'select e.run,e.title,x.status,x.evidence,x.actor,x.created_at from results x join execution_status e on e.id=x.run_case_id order by x.seq desc',
 defects:'select id,title,external_ref,owner,severity,state,resolution from defects order by state,title',
 'release-readiness':'select name,build,environment,total,passed,remaining,open_defects,decision from release_readiness where state=\'open\' order by due_on,name',
 'retest-queue':"select run,title,priority,status,assignee,open_defects from execution_status where state='open' and status in ('failed','blocked','retest') order by due_on,title",
 'stale-cases':'select project,title,reviewed_on,priority from case_coverage where reviewed_on<current_date-90 order by reviewed_on,title',
 coverage:'select project,title,refs,version,approved_by,runs,last_result from case_coverage order by project,title',
 failures:"select e.run,e.title,count(*)::int as failures from results x join execution_status e on e.id=x.run_case_id where x.status='failed' group by e.run,e.title order by failures desc,e.title",
 workload:"select coalesce(nullif(assignee,''),'unassigned') as assignee,count(*)::int as remaining from execution_status where state='open' and status<>'passed' group by assignee order by remaining desc,assignee",
 attention:'select * from attention order by due,item',
 compliance:'select * from compliance_findings order by rule,item',
 activity:'select actor,action,record_id,detail,created_at from activity order by created_at desc,id desc'
};
export const specs={
 ...Object.fromEntries(Object.keys(reads).map(k=>[k,[]])),
 case:['case'],run:['run'],'weekly-review':[],
 'add-project':['name','owner','review-due','retention','actor'],
 'add-case':['project','title','priority','refs','steps','expected','actor'],
 'revise-case':['case','title','priority','refs','steps','expected','actor'],
 'approve-case':['case','actor'],
 'create-run':['project','name','build','environment','due','actor'],
 assign:['run','case','assignee','actor'],
 'record-result':['run','case','status','evidence','note','actor'],
 'add-defect':['run','case','title','ref','owner','severity','actor'],
 'close-defect':['defect','resolution','actor'],
 'close-run':['run','actor'],
 'review-data':['project','review-due','retention','actor'],
 log:['project','note','actor'],
 'draft-release':['run'], 'draft-defect':['defect'],
 import:['project','file','actor','dry-run'], export:['file'],help:[]
};
export function parseArgs(argv){const args=[...argv];const cmd=args.shift()||'help';const o={};const pos=[];for(const a of args){if(a.startsWith('--')){const at=a.indexOf('=');const k=a.slice(2,at<0?undefined:at);if(k in o)throw Error(`Duplicate flag ${k}`);o[k]=at<0?true:a.slice(at+1);}else pos.push(a);}if(!specs[cmd])throw Error(`Unknown command: ${cmd}`);for(const k of Object.keys(o))if(![...specs[cmd],'json'].includes(k))throw Error(`Unknown flag --${k} for ${cmd}`);for(const k of ['json','dry-run'])if(k in o&&o[k]!==true)throw Error(`--${k} is a switch without a value`);if(pos.length&&(cmd!=='import'||pos.join(' ')!=='testrail'))throw Error('Unexpected positional arguments');if(cmd==='import'&&pos[0]!=='testrail')throw Error('Use import testrail');return {cmd,o};}
function required(o,k){if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}=value`);return o[k].trim();}
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Use a real YYYY-MM-DD date');return v;}
function priority(v){if(!['Low','Medium','High','Critical'].includes(v))throw Error('Priority/severity must be Low, Medium, High or Critical');return v;}
export async function resolve(db,tableName,term,scope=null){const label=({cases:'title',defects:'title'})[tableName]||'name';const rows=await db.query(`select * from ${tableName} ${scope?'where project_id=$1':''}`,scope?[scope]:[]);const exact=rows.filter(r=>r.id===term||String(r[label]).toLowerCase()===term.toLowerCase());const matches=exact.length?exact:rows.filter(r=>r.id.startsWith(term)||String(r[label]).toLowerCase().includes(term.toLowerCase()));if(matches.length!==1)throw Error(`${tableName}: ${matches.length?'ambiguous match':'no match'} for ${term}. Candidates: ${(matches.length?matches:rows).map(r=>`${r.id} ${r[label]}`).join('; ')}`);return matches[0];}
async function transaction(db,fn,rollback=false){await db.exec('BEGIN');try{const out=await fn();await db.exec(rollback?'ROLLBACK':'COMMIT');return out;}catch(e){await db.exec('ROLLBACK');throw e;}}
async function audit(db,actor,action,id,detail={}){await db.query('insert into activity(actor,action,record_id,detail) values($1,$2,$3,$4)',[actor,action,id,JSON.stringify(detail)]);}
async function openRun(db,term){const r=await resolve(db,'runs',term);const [locked]=await db.query('select * from runs where id=$1 for update',[r.id]);if(locked.state!=='open')throw Error('Run is closed');return locked;}
async function execution(db,r,term){const c=await resolve(db,'cases',term,r.project_id);const [rc]=await db.query('select * from run_cases where run_id=$1 and case_id=$2',[r.id,c.id]);if(!rc)throw Error('Case is not included in this run');return rc;}
function filePath(name){const p=path.resolve(name);if(!p)throw Error('File required');return p;}
const today=()=>new Date().toISOString().slice(0,10);
export async function execute(db,argv){const {cmd,o}=parseArgs(argv);
 if(cmd==='help')return Object.entries(specs).map(([command,flags])=>({command,flags:flags.map(f=>`--${f}=...`).join(' ')}));
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='weekly-review')return {readiness:await db.query(reads['release-readiness']),attention:await db.query(reads.attention),workload:await db.query(reads.workload)};
 if(cmd==='case'){const c=await resolve(db,'cases',required(o,'case'));return {case:c,history:await db.query('select * from activity where record_id=$1 order by created_at',[c.id]),executions:await db.query('select * from execution_status where case_id=$1 order by due_on',[c.id])};}
 if(cmd==='run'){const r=await resolve(db,'runs',required(o,'run'));return {run:r,checks:await db.query('select * from execution_status where run_id=$1 order by title',[r.id])};}
 if(cmd==='export'){return transaction(db,async()=>{await db.exec('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');const data={format:'test-management-v1',exported_at:new Date().toISOString()};for(const t of ['projects','cases','runs','run_cases','results','defects','activity'])data[t]=await db.query(`select * from ${t} order by id`);if(o.file){const dest=filePath(required(o,'file'));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});return [{file:dest,format:data.format}];}return data;});}
 if(cmd.startsWith('draft-')){let data,id;if(cmd==='draft-release'){const r=await resolve(db,'runs',required(o,'run'));id=r.id;data={readiness:await db.query('select * from release_readiness where id=$1',[id]),checks:await db.query('select title,status,evidence,open_defects from execution_status where run_id=$1 order by title',[id])};}else{data=await resolve(db,'defects',required(o,'defect'));id=data.id;}const root=process.env.OUTPUT_DIR||REPO_ROOT;const dir=path.join(root,'drafts');fs.mkdirSync(dir,{recursive:true});const dest=path.join(dir,`${cmd}-${id}-${Date.now()}.md`);fs.writeFileSync(dest,`# ${cmd==='draft-release'?'Release review':'Defect follow-up'}\n\nDraft for human review. No release or message has been sent.\n\n${JSON.stringify(data,null,2)}\n`,{flag:'wx',mode:0o600});return [{file:dest}];}
 const actor=required(o,'actor');
 return transaction(db,async()=>{
  let row,detail={};
  if(cmd==='add-project'){const due=date(required(o,'review-due'));[row]=await db.query('insert into projects(name,owner,data_review_due,retention_note) values($1,$2,$3,$4) returning *',[required(o,'name'),required(o,'owner'),due,required(o,'retention')]);}
  else if(cmd==='add-case'){const p=await resolve(db,'projects',required(o,'project'));[row]=await db.query('insert into cases(project_id,title,priority,refs,steps,expected) values($1,$2,$3,$4,$5,$6) returning *',[p.id,required(o,'title'),priority(required(o,'priority')),required(o,'refs'),required(o,'steps'),required(o,'expected')]);}
  else if(cmd==='revise-case'){const c=await resolve(db,'cases',required(o,'case'));detail={before:c};[row]=await db.query('update cases set title=$2,priority=$3,refs=$4,steps=$5,expected=$6,version=version+1,approved_by=null,approved_at=null,reviewed_on=current_date where id=$1 returning *',[c.id,required(o,'title'),priority(required(o,'priority')),required(o,'refs'),required(o,'steps'),required(o,'expected')]);}
  else if(cmd==='approve-case'){const c=await resolve(db,'cases',required(o,'case'));if(!c.steps.trim()||!c.expected.trim()||!c.refs.trim())throw Error('Steps, expected outcome and requirement reference are needed before approval');[row]=await db.query('update cases set approved_by=$2,approved_at=now(),reviewed_on=current_date where id=$1 returning *',[c.id,actor]);}
  else if(cmd==='create-run'){const p=await resolve(db,'projects',required(o,'project'));const cases=await db.query('select * from cases where project_id=$1 order by id for update',[p.id]);const approved=cases.filter(c=>c.approved_by);if(!approved.length)throw Error('No approved cases for this project');[row]=await db.query('insert into runs(project_id,name,build,environment,due_on) values($1,$2,$3,$4,$5) returning *',[p.id,required(o,'name'),required(o,'build'),required(o,'environment'),date(required(o,'due'))]);for(const c of approved)await db.query('insert into run_cases(run_id,case_id,snapshot) values($1,$2,$3)',[row.id,c.id,JSON.stringify(c)]);detail={included:approved.length,excluded_unapproved:cases.length-approved.length};}
  else if(['assign','record-result','add-defect'].includes(cmd)){const r=await openRun(db,required(o,'run'));const rc=await execution(db,r,required(o,'case'));
   if(cmd==='assign')[row]=await db.query('update run_cases set assignee=$2 where id=$1 returning *',[rc.id,required(o,'assignee')]);
   if(cmd==='record-result'){const status=required(o,'status');if(!['passed','failed','blocked','retest'].includes(status))throw Error('Status must be passed, failed, blocked or retest');[row]=await db.query('insert into results(run_case_id,status,evidence,note,actor) values($1,$2,$3,$4,$5) returning *',[rc.id,status,required(o,'evidence'),typeof o.note==='string'?o.note:'',actor]);}
   if(cmd==='add-defect')[row]=await db.query('insert into defects(run_case_id,title,external_ref,owner,severity) values($1,$2,$3,$4,$5) returning *',[rc.id,required(o,'title'),required(o,'ref'),required(o,'owner'),priority(required(o,'severity'))]);
  }
  else if(cmd==='close-defect'){const d=await resolve(db,'defects',required(o,'defect'));let [e]=await db.query('select * from execution_status where id=$1',[d.run_case_id]);await openRun(db,e.run_id);[e]=await db.query('select * from execution_status where id=$1',[d.run_case_id]);const [current]=await db.query('select * from defects where id=$1',[d.id]);if(current.state!=='open')throw Error('Defect is already closed');if(e.status!=='passed')throw Error('A passing retest is required before closing the defect');[row]=await db.query("update defects set state='closed',resolution=$2 where id=$1 returning *",[d.id,required(o,'resolution')]);}
  else if(cmd==='close-run'){const r=await openRun(db,required(o,'run'));const [ready]=await db.query('select * from release_readiness where id=$1',[r.id]);if(ready.decision!=='ready for human review')throw Error('Run has unresolved checks or defects');[row]=await db.query("update runs set state='closed',closed_by=$2,closed_at=now() where id=$1 returning *",[r.id,actor]);detail={meaning:'Test run closed; does not deploy or authorise production release'};}
  else if(cmd==='review-data'){const p=await resolve(db,'projects',required(o,'project'));const due=date(required(o,'review-due'));if(due<=today())throw Error('Next review must be a future date');[row]=await db.query('update projects set data_review_due=$2,retention_note=$3 where id=$1 returning *',[p.id,due,required(o,'retention')]);}
  else if(cmd==='log'){row=await resolve(db,'projects',required(o,'project'));detail={note:required(o,'note')};}
  else if(cmd==='import')return importCases(db,o,actor);
  else throw Error(`Unimplemented command ${cmd}`);
  await audit(db,actor,cmd,row.id,detail);return [row];
 },o['dry-run']===true);
}
async function importCases(db,o,actor){
 const p=await resolve(db,'projects',required(o,'project'));await db.query('select id from projects where id=$1 for update',[p.id]);
 const records=parseCsv(fs.readFileSync(filePath(required(o,'file')),'utf8'));if(!records.length)throw Error('No CSV records');
 const seen=new Set();let inserted=0,updated=0,unchanged=0;
 for(let i=0;i<records.length;i++){
  const r=records[i];const id=pick(r,'ID').trim();const title=pick(r,'Title').trim();if(!/^C?\d+$/.test(id)||!title)throw Error(`Row ${i+2}: ID and Title required`);const external='C'+id.replace(/^C/,'');if(seen.has(external))throw Error(`Duplicate ID ${external}: export one row per case; do not separate steps into rows`);seen.add(external);
  const values={title,section:pick(r,'Section'),priority:priority(pick(r,'Priority')||'Medium'),test_type:pick(r,'Type')||'Functional',refs:pick(r,'References'),steps:pick(r,'Steps')||pick(r,'Steps (Step)'),expected:pick(r,'Expected Result')||pick(r,'Expected Results')||pick(r,'Steps (Expected Result)'),source_data:r};
  const [old]=await db.query('select * from cases where project_id=$1 and external_id=$2 for update',[p.id,external]);
  const same=old&&Object.entries(values).every(([k,v])=>k==='source_data'?Object.keys(v).length===Object.keys(old[k]).length&&Object.entries(v).every(([a,b])=>old[k][a]===b):old[k]===v);
  if(same){unchanged++;continue;}
  const params=[p.id,external,...Object.values(values).map(v=>typeof v==='object'?JSON.stringify(v):v)];
  const [row]=await db.query('insert into cases(project_id,external_id,title,section,priority,test_type,refs,steps,expected,source_data) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict(project_id,external_id) do update set title=excluded.title,section=excluded.section,priority=excluded.priority,test_type=excluded.test_type,refs=excluded.refs,steps=excluded.steps,expected=excluded.expected,source_data=excluded.source_data,version=cases.version+1,approved_by=null,approved_at=null,reviewed_on=current_date returning id',[...params]);
  await audit(db,actor,'import-case',row.id,{external_id:external,before:old||null});old?updated++:inserted++;
 }
 return [{project:p.name,inserted,updated,unchanged,dry_run:o['dry-run']===true,scope:'case library only; approvals require local review'}];
}
export function human(data){if(Array.isArray(data)){if(!data.length)return '(none)';return table(data,Object.keys(data[0]).map(key=>({key,label:key,format:v=>v!==null&&typeof v==='object'?JSON.stringify(v):v})));}return Object.entries(data).map(([k,v])=>`${k}\n${Array.isArray(v)?human(v):JSON.stringify(v,null,2)}`).join('\n\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const data=await execute(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(data,null,2):human(data));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
