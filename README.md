# Test Management for Claude Code

Know which release is held, which checks need retesting and where the evidence lives. An MIT-licensed database and command set for software testing teams. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Try the demo and bring across a TestRail case CSV. | Your case fields, approval rules, reports, history and a web front end or different stack if needed. | Installed, connected and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=testrail&utm_source=github&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=testrail&utm_source=github&utm_medium=managed) |

## The weekly release meeting

Five rituals: review cases, prepare a regression run, record results with evidence, triage defects and decide what is ready for release review. The fictional Harbour Portal demo contains an overdue run, an expired invitation defect, an untested export check and an unapproved accessibility case.

## Quick start

Node 20 or later. Windows and Linux commands:

```bash
git clone https://github.com/Enterprise-DNA-OS/test-management-for-claude-code.git
cd test-management-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

The embedded PGlite database is stored under .data/db. DATABASE_URL selects Postgres 15 or later with verified TLS. For real data, set a fresh DATA_DIR, migrate without seed, register your project and import your case CSV. Never mix demo and customer records. Local mode supports one process. A shared installation needs authenticated operators, restricted database roles and tested backups. Actor names are attribution, not authentication.

There are 34 CLI commands including help, and 35 recurring slash recipes including /customise and /new-view. [Arguments and calculations](docs/cli.md). All reads and writes support --json. Ambiguous matches list candidates and exit 1.

## What the release decision means

A run snapshots approved cases. Results are append-only and the latest result controls each check's status. Every result needs evidence and an actor. An incomplete run or any open defect holds the run. Closing a defect needs a passing retest and a resolution. Closing a run never deploys or authorises a production release. Revising a case clears its approval without changing earlier run snapshots.

## Ten questions beyond a fixed report

TestRail already has reporting and an agent connection. These questions demonstrate the shipped queries, not an unverified claim that its product cannot answer them.

1. Which release has passing checks but unresolved defects? release-readiness
2. Which failed checks need a named owner today? retest-queue
3. Which cases have not been reviewed for ninety days? stale-cases
4. Which case has no recorded requirement or risk reference? compliance
5. Who has the most unfinished checks? workload
6. Which cases failed repeatedly across recorded attempts? failures
7. What evidence changed a failed check into a pass? results
8. Which exact case version was included in this release? run
9. Which projects need a test-data retention review? compliance
10. Who changed a case, and what did the previous version contain? case

## Your first hour: ten things to ask for

1. Put our name, logo and colours on the release report.
2. Show what holds the current release.
3. Assign the unfinished checks to their real owners.
4. Draft a defect follow-up with the failed evidence.
5. Check our case export without saving it.
6. Import the approved mapping into a fresh project.
7. Review the imported instructions before approving cases.
8. Create a regression run for the next build.
9. Add our risk category with /customise.
10. Add a weekly owner report with /new-view.

## Paperwork and read-only views

brand.json controls the business name, logo and colours. npm run docs creates release evidence packs, defect follow-ups and test-data review records. npm run view creates the release room and case library review. Drafts stay in drafts/. Protect reports and exports as private business data.

[Record checks](docs/compliance.md) distinguish privacy review reminders from internal test policies. [Why no front end](docs/why-no-front-end.md) covers mobile, offline and interactive workflows. Nothing sends, deploys, signs a regulated approval or calls a vendor system.

## Move from TestRail

[The replacement guide](docs/replace-testrail.md) explains the one-command case-library import, mapping, test run, repeat-import behaviour and reconciliation. Historical results and attachments need a separately agreed migration. It is not a whole-account clone.

## Verification

npm test uses a temporary database and exercises all 34 commands, result history, run snapshots, release holds, retest requirements, repeat imports, rollback, ambiguous names, escaped HTML, documents, drafts and exports. CI defines Windows and Linux checks plus a Postgres run. TEST_DATABASE_URL is accepted only for an empty disposable database. TEST_VENDOR_CSV optionally validates the vendor's public reference export. [Research and selection](docs/research.md).

MIT licence. Not affiliated with TestRail or Anthropic. Hosting and agent usage have separate costs. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=testrail&utm_source=github&utm_medium=readme).
