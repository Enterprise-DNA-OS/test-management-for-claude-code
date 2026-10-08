# Command reference

Run npm run testing -- <command> [flags]. All flags use --name=value, with quotes around shell values containing spaces. --json returns structured output. Names match without case sensitivity; exact names win, then partial names and ID prefixes. Multiple matches list candidates and exit 1.

| Command | Flags | Purpose |
|---|---|---|
| projects | none | List project owners and test-data review dates |
| cases | none | Review the case library and approvals |
| runs | none | List test runs and their readiness |
| results | none | Read every recorded result, including earlier failures |
| defects | none | Review defect owners and resolutions |
| release-readiness | none | Find releases held by unfinished tests or defects |
| retest-queue | none | Find failed, blocked and retest checks |
| stale-cases | none | Review cases older than the internal 90-day review interval |
| coverage | none | Trace case references, approvals and execution history |
| failures | none | Find cases with repeated recorded failures |
| workload | none | See unfinished checks by assignee |
| attention | none | Find overdue runs, stale cases and missing reviews |
| compliance | none | Check retention review records and internal testing controls |
| activity | none | Read the append-only change history |
| case | --case | Read a case with its history and run snapshots |
| run | --run | Read a run and every included check |
| weekly-review | none | Prepare the weekly release, attention and workload review |
| add-project | --name, --owner, --review-due, --retention, --actor | Register a project with a data-retention review |
| add-case | --project, --title, --priority, --refs, --steps, --expected, --actor | Write a draft test case |
| revise-case | --case, --title, --priority, --refs, --steps, --expected, --actor | Revise a case and clear its approval |
| approve-case | --case, --actor | Approve the current case version after reviewing its steps |
| create-run | --project, --name, --build, --environment, --due, --actor | Snapshot the approved case library into a new run |
| assign | --run, --case, --assignee, --actor | Assign an included check |
| record-result | --run, --case, --status, --evidence, --note, --actor | Record a result with evidence |
| add-defect | --run, --case, --title, --ref, --owner, --severity, --actor | Track a defect against an included check |
| close-defect | --defect, --resolution, --actor | Close a defect after a passing retest |
| close-run | --run, --actor | Close a completed run after all checks pass and defects close |
| review-data | --project, --review-due, --retention, --actor | Record a test-data purpose and retention review |
| log | --project, --note, --actor | Log a project decision |
| draft-release | --run | Draft release evidence for human review |
| draft-defect | --defect | Draft a defect follow-up for human review |
| import testrail | --project, --file, --actor, --dry-run | Import a TestRail case-library CSV with a test run first |
| export | --file | Export every record and snapshot to private JSON |
| help | none | Show every command and flag |

All mutation flags are required except record-result --note. import --dry-run is a switch without a value. export --file is optional; without it the complete export is returned. Paths are relative to the current directory. Drafts and HTML outputs can be isolated with OUTPUT_DIR. Imports and drafts never send or contact TestRail.

Priority and severity: Low, Medium, High, Critical. Results: passed, failed, blocked, retest. Dates: valid YYYY-MM-DD. Test-data review dates must be in the future when recording a completed review. Projects and run names are unique within their scope. Use IDs when case titles overlap.

## Calculations and controls

The latest result is the greatest database sequence number for each included case. Retesting appends a record, so the earlier failure stays visible. A run is ready for human review only when it has at least one check, every latest result passes and every linked defect is closed. No percentage rounding can turn an incomplete run green. A passing result alone does not close defects. A defect closes only after a passing retest and a resolution note.

Coverage lists recorded references; it does not know requirements absent from the database. Failures counts historical failed results, not current failing cases. Workload counts included cases with a latest result other than passed in open runs. Stale cases use an internal 90-day review threshold. It is configurable business policy, not law.

create-run includes every approved case in a project and records how many draft cases it excluded in activity. Case snapshots preserve the version, steps and expected outcome at inclusion. Later edits to the library do not repair an existing snapshot. Create a new run for a changed build, environment or case set. Test execution itself is performed by people or their existing test tools; this system stores their evidence.

## Typical flow

```bash
npm run testing -- add-project --name="Portal" --owner="Morgan" --review-due=2027-01-01 --retention="Synthetic test accounts only" --actor="Morgan"
npm run testing -- import testrail --project="Portal" --file=imports/cases.csv --actor="Morgan" --dry-run
npm run testing -- import testrail --project="Portal" --file=imports/cases.csv --actor="Morgan"
npm run testing -- cases --json
npm run testing -- approve-case --case=CANDIDATE_ID --actor="Morgan"
npm run testing -- create-run --project="Portal" --name="Release candidate" --build=rc1 --environment=staging --due=2027-01-01 --actor="Morgan"
npm run testing -- record-result --run="Release candidate" --case=CANDIDATE_ID --status=passed --evidence="ticket:QA-42" --actor="Ari"
npm run testing -- release-readiness
npm run testing -- export --file=exports/release-backup.json
```

Evidence references are stored as supplied; the CLI does not fetch or validate their contents. Use controlled storage and check that reviewers can open them. Local output contains private operational data. Protect it accordingly.
