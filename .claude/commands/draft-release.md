---
description: Draft release evidence for human review.
---

# draft-release

Read CLAUDE.md and docs/cli.md. Draft release evidence for human review.

Run `npm run testing -- draft-release --run="<run>"`. Use values the operator supplies. Every read supports --json.

The command writes a draft into drafts/. Read it and report its path. A person decides whether to send it.

No command sends a message, deploys a release or changes a vendor system.
