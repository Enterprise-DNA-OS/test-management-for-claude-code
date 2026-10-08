# Bring the TestRail case library across

Verified source, 8 October 2026: [TestRail export instructions](https://support.testrail.com/hc/en-us/articles/15144643126932-Export-test-cases). The vendor publishes a reference CSV linked from that article. The smoke suite was also run against that public reference: 82 unique case IDs. The checked-in example uses fictional records in those header shapes.

## Export

Open the project’s Test Cases page, choose Export and CSV, then select the sections and columns. Include ID, Title, Priority, References, Section, Type, Steps and Expected Result when available. Keep one row per case. Leave the option for separated steps on separate rows off. A CSV without execution instructions can be imported for review but cannot be approved until steps and expected outcomes are filled.

## One import command

Use a fresh DATA_DIR and npm run migrate for real records, without seed. First register a project with add-project. Save the export under imports/.

```bash
npm run testing -- import testrail --project="Portal" --file=imports/cases.csv --actor="Morgan" --dry-run
npm run testing -- import testrail --project="Portal" --file=imports/cases.csv --actor="Morgan"
```

The first command validates the whole file and rolls back. The second commits the same mapping atomically. A bad later row leaves no earlier rows behind. Rerunning unchanged data reports unchanged counts. Changed cases increase their version and clear approval. Old run snapshots stay as they were.

| Export column | Local field |
|---|---|
| ID | Stable project-scoped external ID, C prefix normalised |
| Title | Case title |
| Section | Section text |
| Priority | Low, Medium, High or Critical |
| Type | Test type text |
| References | Requirement or risk references |
| Steps or Steps (Step) | Execution instructions |
| Expected Result, Expected Results or Steps (Expected Result) | Expected outcome |
| All original columns | Preserved source_data for review |

Custom priorities need an explicit mapping before import. Duplicate case IDs, malformed quotes, duplicate headers and uneven rows are refused. The reference export contains case metadata and has empty expected results; the importer does not fabricate missing instructions. It supports a one-row CSV, not every TestRail export variation. Review custom fields and rich text before relying on the imported instructions.

## Reconcile before switching

Compare source case counts and IDs, spot-check multiline steps and references, and approve the imported versions locally. Create a run, complete a small known test set and compare the evidence report. Keep the original export and vendor account available until the operator accepts the migration.

Historical runs, plans, milestones, attachments, separated step result histories, external defect contents and TestRail approval identities are not reconstructed by a case CSV. Archive or migrate these separately before cancelling anything. The export command provides a complete JSON record backup, including snapshots and activity; restoring it requires a reviewed database restore process. It is not a TestRail re-import file.

Enterprise DNA maps additional history and custom fields as part of an agreed migration. One day is a workable trial for the supported case library, not a promise to migrate every linked system.
