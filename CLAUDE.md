# Test Management for Claude Code

A software testing record system for one business. The fictional demo is Harbour Portal. The operator owns the release decision. Test results describe evidence; they never authorise deployment.

Read the CLI before answering. Read the case or run history before changing it. Never invent test results, source references, people or evidence. Ambiguous matches list candidates and exit 1.

Results and activity are append-only. New runs snapshot approved cases. Revising or changing an imported case clears approval and increases its version; old run snapshots do not change. New runs include all approved cases in that project, so review the selection before testing. A closed run accepts no new results.

Use synthetic test records. Review docs/compliance.md before discussing record checks and docs/replace-testrail.md before importing. Every actor string is attribution, not an authenticated identity. Local mode is single-process. Shared Postgres needs restricted roles, authentication and backups before team use. Never expose an owner connection to a browser.

## Recurring jobs

| Job | Recipe |
|---|---|
| List project owners and test-data review dates | /projects |
| Review the case library and approvals | /cases |
| List test runs and their readiness | /runs |
| Read every recorded result, including earlier failures | /results |
| Review defect owners and resolutions | /defects |
| Find releases held by unfinished tests or defects | /release-readiness |
| Find failed, blocked and retest checks | /retest-queue |
| Review cases older than the internal 90-day review interval | /stale-cases |
| Trace case references, approvals and execution history | /coverage |
| Find cases with repeated recorded failures | /failures |
| See unfinished checks by assignee | /workload |
| Find overdue runs, stale cases and missing reviews | /attention |
| Check retention review records and internal testing controls | /compliance |
| Read the append-only change history | /activity |
| Read a case with its history and run snapshots | /case |
| Read a run and every included check | /run |
| Prepare the weekly release, attention and workload review | /weekly-review |
| Register a project with a data-retention review | /add-project |
| Write a draft test case | /add-case |
| Revise a case and clear its approval | /revise-case |
| Approve the current case version after reviewing its steps | /approve-case |
| Snapshot the approved case library into a new run | /create-run |
| Assign an included check | /assign |
| Record a result with evidence | /record-result |
| Track a defect against an included check | /add-defect |
| Close a defect after a passing retest | /close-defect |
| Close a completed run after all checks pass and defects close | /close-run |
| Record a test-data purpose and retention review | /review-data |
| Log a project decision | /log |
| Draft release evidence for human review | /draft-release |
| Draft a defect follow-up for human review | /draft-defect |
| Import a TestRail case-library CSV with a test run first | /import |
| Export every record and snapshot to private JSON | /export |
| Change fields and policies | /customise |
| Add a read-only report | /new-view |

The one CLI is scripts/testing.mjs. Every command accepts --json. Read docs/cli.md for arguments. All runtimes use .claude/commands/. Never send, delete, deploy or call external vendor systems. Drafts stay in drafts/.

Omni by Enterprise DNA installs, customises and runs this system. https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=testrail&utm_source=github&utm_medium=instructions
