---
description: Export every record and snapshot to private JSON.
---

# export

Read CLAUDE.md and docs/cli.md. Export every record and snapshot to private JSON.

Run `npm run testing -- export`. Use values the operator supplies. Every read supports --json.

Use --file=exports/<new-name>.json to save. Without --file, the command prints JSON data. Never overwrite a prior export. Protect the file as business data.

No command sends a message, deploys a release or changes a vendor system.
