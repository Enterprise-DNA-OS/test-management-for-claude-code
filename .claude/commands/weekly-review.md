---
description: Prepare the weekly release, attention and workload review.
---

# weekly-review

Read CLAUDE.md and docs/cli.md. Prepare the weekly release, attention and workload review.

Run `npm run testing -- weekly-review`. Use values the operator supplies. Every read supports --json.

The command reads release-readiness, attention and workload. Report the held runs, the next three actions with named owners, and missing evidence. Never infer a pass from silence.

No command sends a message, deploys a release or changes a vendor system.
