# DV Choice Editor

Dataverse choice management inside VS Code.

**DV Choice Editor** is a focused utility from **DV ForgeLab** for managing Dataverse local choice columns and global choices directly from VS Code.

The extension provides a lightweight, preview-first workflow for creating, updating, deleting, reviewing, and publishing Dataverse choice values without leaving the development workspace.

---

## v1.3.0 — Global Choice Support

DV Choice Editor now supports both local entity choice columns and global choices through the same preview-first workflow.

Supported local/global operations:

- Load choice values
- Add values
- Update labels
- Delete values
- Preview staged metadata changes
- Apply and publish explicitly
- Export `.dvce.json` definition artifacts
- Import `.dvce.json` definition artifacts for reconstruction

The v2.0 artifact contract includes an explicit `scope` field so DV Quick Run can generate choice reconstruction artifacts that DV Choice Editor can import directly. Legacy v1.0 local artifacts remain supported.

## Screenshot

![DV Choice Editor](docs/dvce-page.png)

### Highlights

- Preview-first metadata updates
- Local and global choice support
- JSON choice definition import and export
- Environment-aware publishing (DEV / TEST / PROD)
- Staged changes before publish
- Add, update, and delete choice values
- Export selected choice definitions as `.dvce.json` artifacts
- Import `.dvce.json` artifacts into local or global choice targets
- Safety guardrails for production environments
- Built for Dataverse developers working inside VS Code
- Direct DV ForgeLab feedback integration

---

## Features

### Manage Dataverse Choice Values

- Browse local entity choice columns
- Browse global choices
- View existing choice values
- Create new choice values
- Update choice labels
- Delete choice values
- Preview metadata changes before publishing

### JSON Definition Artifacts

DV Choice Editor can export local or global choice definitions as JSON artifacts and import compatible definitions back into DV Choice Editor for reconstruction workflows.

#### Local Choice Artifact

```json
{
  "artifactType": "dvce.choiceDefinition",
  "version": "2.0",
  "scope": "local",
  "entityLogicalName": "account",
  "attributeLogicalName": "new_membershiptype",
  "values": [
    {
      "label": "Gold",
      "value": 100000000
    }
  ]
}
```

#### Global Choice Artifact

```json
{
  "artifactType": "dvce.choiceDefinition",
  "version": "2.0",
  "scope": "global",
  "optionSetName": "new_membershiptype",
  "values": [
    {
      "label": "Gold",
      "value": 100000000
    }
  ]
}
```

Imported definitions are compared against the currently loaded target. Missing values and label changes are staged locally, then reviewed through the normal preview-first workflow before publishing.

### Preview-First Workflow

All metadata changes are staged locally before being applied.

```text
Select local choice column
or
Select global choice
↓
Stage changes
↓
Review preview
↓
Apply and publish
```

### Environment Awareness

DV Choice Editor detects the connected environment and provides visual indicators:

* DEV
* TEST
* PROD

Production-class environments display elevated publish warnings before metadata changes are applied.

### Safety Features

* Preview-first mutation workflow
* Local staging before publish
* Remove individual staged changes
* Clear all staged changes
* Prevent deletion of the final remaining choice value
* Boolean choice editing safeguards
* Choice values treated as immutable identities after creation
* Inspect potential usage across forms, views, personal views, and processes
* Import JSON definitions into local staged changes
* Export selected choices as reusable JSON definitions
* Read-only protection for non-customizable global choices
* View/export support for read-only global choices
* Global choice metadata validation

## Shared DV ForgeLab Environment Settings

DV Choice Editor supports the shared DV ForgeLab environment setting:

```json
"dvForgeLab.environments": [
  {
    "name": "DEV",
    "url": "https://org.crm6.dynamics.com",
    "tenantId": "optional-tenant-id"
  }
]
```

This setting can be reused by DV ForgeLab utilities. The legacy `dvChoiceEditor.environments` setting remains supported as a fallback.

---

## Commands

### Open Choice Editor

```text
DV Choice Editor: Open Choice Editor
```

---

## Feedback

DV Choice Editor includes direct integration with the DV ForgeLab feedback portal.

Share:

* Feature requests
* Bug reports
* Metadata reconstruction scenarios
* Workflow suggestions
* Product feedback

Feedback is routed through the shared DV ForgeLab feedback experience and automatically identifies DV Choice Editor as the source product.

https://www.dvforgelab.com/feedback

---

## Scope

DV Choice Editor intentionally focuses on Dataverse choice management.

### Supported

* Local entity choice columns
* Global choices
* JSON definition import/export
* Preview-first metadata publishing

### Not Included

* CSV import/export
* Solution management
* Multi-language labels
* Metadata administration beyond choice values
* Bulk editing workflows
* Cross-environment comparison
* Timeline reconstruction
* Drift analysis

---

## Why DV Choice Editor?

Many Dataverse customization tasks still require switching between browser-based administration experiences and development tooling.

DV Choice Editor brings a focused choice management workflow directly into VS Code while preserving explicit review and publish steps.

---

## Part of the DV ForgeLab Family

DV Choice Editor is a focused Dataverse utility from DV ForgeLab.

For operational investigation, execution, runtime analysis, and cross-environment comparison, see DV Quick Run.

DV Choice Editor follows the same principles:

* Preview-first
* Environment-aware
* Metadata-backed
* Explicit execution
* Calm operational UX

---

Built by **DV ForgeLab**.
