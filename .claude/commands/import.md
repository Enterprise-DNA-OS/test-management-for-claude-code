---
description: Import a TestRail case-library CSV with a test run first.
---

# import

Read CLAUDE.md and docs/cli.md. Import a TestRail case-library CSV with a test run first.

Run `npm run testing -- import testrail --project="<project>" --file="<file>" --actor="<actor>"`. Use values the operator supplies. Every read supports --json.

Run with --dry-run first. Require ID and Title, one row per case. Compare source and imported counts. This imports the case library, not old runs or attachments.

No command sends a message, deploys a release or changes a vendor system.
