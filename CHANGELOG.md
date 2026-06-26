# Changelog

## 1.4.0

### Added

* Added native **DVCE Choice Definition Artifact v3.0** support using `artifactType: "dvce.choiceDefinition"`.
* Added operation-based import staging for `AddOption`, `UpdateLabel`, and `DeleteOption`.
* Added workspace-first import/export support under `.dvforgelab/dvce/exports` when a VS Code workspace is available.
* Added support for importing both standard `.json` exports and DVQR-generated `.dvce.json` reconstruction artifacts.

### Changed

* DVCE manual exports now use plain `.json` files.
* DVQR reconstruction artifacts use the `.dvce.json` extension while preserving the same DVCE-owned schema.
* Exported artifacts now include `generatedBy`, `generatedUtc`, and an `operations` array for forward-compatible reconstruction workflows.
* Export filenames now follow the standard convention:

  * Local: `dvce-{entity}-{attribute}-{yyyyMMdd-HHmmss}.json`
  * Global: `dvce-{globalChoiceName}-{yyyyMMdd-HHmmss}.json`

### Preserved

* Existing v1.x/v2.x `dvce.choiceDefinition` value-array imports remain fully supported.
* Preview-first staging remains mandatory before any Dataverse metadata mutation.

# Change Log

All notable changes to the "DV Choice Editor" extension will be documented in this file.

## [1.3.0] - Global Choice Support & DVQR Reconstruction Readiness

- Added global choice discovery and value loading.
- Added shared local/global `ChoiceTarget` architecture to avoid duplicated workflows.
- Extended add, edit, delete, preview, apply, publish, JSON export, and JSON import to work against local choice columns and global choices.
- Added DVCE choice definition artifact v2.0 with explicit `scope: "local" | "global"`.
- Preserved backward compatibility for v1.0 local choice definition artifacts.
- Refactored import/export parsing and staging into reusable product services for DVQR reconstruction readiness.
- Local usage inspection remains intentionally scoped to entity choice columns.
- Added read-only protection for non-customizable global choices.
- Disabled Add, Edit, Delete, Apply, and Publish actions for read-only global choice targets.
- Allowed read-only global choices to remain viewable/exportable for inspection and backup.
- Improved global choice metadata handling by avoiding invalid `$expand=Options` usage.
- Filtered unsupported Boolean global option set editing scenarios.

---

## [1.2.2] - Feedback button

- Added a Feedback button linking to the shared DV ForgeLab feedback portal.
- Feedback opens `https://dvforgelab.com/feedback` with DV Choice Editor and the current extension version preselected.

## [1.2.1] - Documentation & Branding Refresh

### Changed

- Added DV ForgeLab website links across documentation.
- Updated footer links to point to dvforgelab.com and dvquickrun.com.
- Refreshed README screenshots and workflow documentation.
- Improved product ecosystem references.

## [1.2.0] - 2026-06-10

### Added

- JSON export for the selected Dataverse choice definition.
- JSON import for DV Choice Editor definition artifacts.
- DVCE JSON definition artifact shape for future DV ForgeLab ecosystem workflows.
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