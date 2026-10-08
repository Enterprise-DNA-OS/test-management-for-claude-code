# Record checks and their limits

Checked 8 October 2026. This is a general software testing ledger, not a validated system for clinical trials, medical devices, financial regulatory submissions or safety certification. The operator remains responsible for applicable obligations.

## External rules

New Zealand Privacy Act information privacy principle 9 limits how long personal information is retained for its lawful purpose. Source: https://www.privacy.org.nz/privacy-principles/9/ . The IPP9-review check flags a missing retention note or a project review date that has arrived. It prompts a person to review evidence and purpose. It does not prescribe a legal retention period, inspect external attachments, delete records or establish that retention is lawful.

Principle 5 concerns safeguards against loss, misuse and unauthorised access or disclosure. Source: https://www.privacy.org.nz/privacy-principles/5/ . The database has public access revoked and row-level security enabled without public policies. The local operator uses an owner connection; this is not user authentication. Shared deployments require authenticated operators, restricted roles, protected backups and evidence access controls. There is no automatic certification check for principle 5.

## Internal controls

INTERNAL-case-approval flags an unapproved case version. Approval requires steps, an expected outcome and a reference. INTERNAL-traceability flags missing requirement or risk references. INTERNAL-failure-tracking flags a failed latest execution without a linked defect. These are our shipped testing policies, not statutory rules.

The 90-day case review threshold and the project's next data-review date are configurable internal policies. Close-run requires passing latest results and closed defects. It closes the test run only. Production deployment, risk acceptance and release approval remain with the business.

Results and recorded activity reject updates and deletes. Owners of the database can change the software and its triggers, so this is not a tamper-proof archive, cryptographic signature service or independent compliance attestation. Actor labels are supplied text.

Use synthetic identities and fictional test accounts. Imports preserve all source columns in the case record, including any author names supplied by the export. Review these before import and minimise personal data. Exported reports and drafts need the same access controls as the database.
