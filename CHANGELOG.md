# Change Log

All notable changes to the "DV Choice Editor" extension will be documented in this file.

---

## [1.2.0] - 2026-06-10

### Added

- JSON export for the selected Dataverse choice definition.
- JSON import for DV Choice Editor definition artifacts.
- `.dvce.json` definition artifact shape for future DV ForgeLab ecosystem workflows.
- Import comparison against the selected choice column to stage missing values and label updates.
- Import summary showing added, updated, and skipped choice values.

### Changed

- Marketplace wording now reflects definition artifact import/export support.
- Choice definitions can now be exported for reuse, review, or future reconstruction workflows.

### Safety

- Imported values are staged locally before mutation.
- Imported JSON does not apply changes directly.
- Imported definitions must match the selected entity and choice column when those targets are specified.
- Preview-first apply and publish semantics remain unchanged.

### Notes

- JSON import/export is intentionally scoped to selected local choice columns.
- DV Choice Editor remains a choice-value utility, not a broader metadata manager.

## [1.1.0] - 2026-06-10

### Added

- Shared DV ForgeLab environment setting support via `dvForgeLab.environments`.
- Legacy `dvChoiceEditor.environments` fallback remains supported.
- Choice usage inspection for selected choice columns.
- Potential reference detection across forms, system views, personal views, and business rules / processes.
- Usage inspection results grouped by metadata source.
- DV Quick Run Marketplace hyperlink in the utility footer.

### Notes

- Usage inspection reports potential metadata references based on the selected choice column logical name. It does not claim runtime certainty.

## [1.0.0] - 2026-06-09

### Added

- Initial public release of DV Choice Editor.
- Dataverse local choice (option set) management inside VS Code.
- Entity-scoped choice column discovery.
- Choice value browsing with metadata-backed loading.
- Add choice value workflow.
- Edit choice label workflow.
- Delete choice value workflow.
- Preview-first metadata update experience.
- Staged change tracking before publish.
- Metadata update preview surface.
- Dataverse publish integration after metadata updates.
- Environment-aware connection support.
- Environment switching support.
- DEV / TEST / PROD environment indicators.
- Environment-aware publish warnings.
- Pending change management.
- Remove individual staged changes.
- Clear all staged changes.
- Protection against deleting the final remaining choice value.
- Boolean column filtering to prevent unsupported editing scenarios.

### UX

- DV ForgeLab utility branding.
- Shared DV ForgeLab visual design language.
- Environment status badges.
- Choice status badges:
  - System
  - Managed
  - Custom
- Add / Update / Delete operation badges.
- Preview-first operational workflow.
- Metadata update summaries before publish.

### Safety

- Metadata changes are staged locally before execution.
- Publish actions require explicit preview review.
- Production environments display elevated publish warnings.
- Choice values remain identity-based and are not editable after creation.

### Notes

DV Choice Editor is intentionally scoped as a focused Dataverse utility.

The extension provides a lightweight choice management experience without expanding into solution management, metadata administration, or broader Dataverse governance scenarios.

Built by DV ForgeLab.