import { ChoiceColumnViewModel, ChoiceEditorViewModel, ChoiceUsageGroupViewModel, EntityViewModel, GlobalChoiceViewModel } from '../product/choiceEditorTypes';
import { escapeHtml } from '../shared/escaping';
import { choiceEditorStyles } from './choiceEditorStyles';
import { choiceEditorScript } from './choiceEditorScript';

type RenderOptions = {
	logoUri: string;
	cspSource: string;
};

function renderEntityOptions(entities: EntityViewModel[], selectedLogicalName?: string): string {
	if (!entities.length) {
		return '<option value="">Connect to load entities</option>';
	}

	return [
		'<option value="">Select entity</option>',
		...entities.map(entity => {
			const label = entity.displayName && entity.displayName !== entity.logicalName
				? `${entity.displayName} (${entity.logicalName})`
				: entity.logicalName;
			const selected = entity.logicalName === selectedLogicalName ? ' selected' : '';
			return `<option value="${escapeHtml(entity.logicalName)}"${selected}>${escapeHtml(label)}</option>`;
		})
	].join('');
}

function renderChoiceOptions(choices: ChoiceColumnViewModel[], selectedLogicalName?: string): string {
	if (!choices.length) {
		return '<option value="">Select an entity first</option>';
	}

	return [
		'<option value="">Select choice column</option>',
		...choices.map(choice => {
			const label = choice.displayName && choice.displayName !== choice.logicalName
				? `${choice.displayName} (${choice.logicalName}) • ${choice.type}`
				: `${choice.logicalName} • ${choice.type}`;
			const selected = choice.logicalName === selectedLogicalName ? ' selected' : '';
			return `<option value="${escapeHtml(choice.logicalName)}"${selected}>${escapeHtml(label)}</option>`;
		})
	].join('');
}

function renderGlobalChoiceOptions(choices: GlobalChoiceViewModel[], selectedName?: string): string {
	if (!choices.length) {
		return '<option value="">Connect to load global choices</option>';
	}

	return [
		'<option value="">Select global choice</option>',
		...choices.map(choice => {
			const mutability = choice.isCustomizable === false ? ' • read-only' : '';
			const label = choice.displayName && choice.displayName !== choice.name
				? `${choice.displayName} (${choice.name})${choice.type ? ` • ${choice.type}` : ''}${mutability}`
				: `${choice.name}${choice.type ? ` • ${choice.type}` : ''}${mutability}`;
			const selected = choice.name === selectedName ? ' selected' : '';
			return `<option value="${escapeHtml(choice.name)}"${selected}>${escapeHtml(label)}</option>`;
		})
	].join('');
}

function getEnvironmentPillClass(viewModel: ChoiceEditorViewModel): string {
	if (viewModel.environment.safety === 'Red') {
		return 'danger';
	}

	if (viewModel.environment.safety === 'Amber') {
		return 'warning';
	}

	if (viewModel.environment.safety === 'Grey') {
		return 'grey';
	}

	return 'accent';
}

function getApplyButtonClass(viewModel: ChoiceEditorViewModel): string {
	if (viewModel.environment.safety === 'Red') {
		return 'danger-primary';
	}

	if (viewModel.environment.safety === 'Amber') {
		return 'warning-primary';
	}

	return 'primary';
}

function getPreviewCardClass(viewModel: ChoiceEditorViewModel): string {
	if (viewModel.environment.safety === 'Red') {
		return 'danger-preview';
	}

	if (viewModel.environment.safety === 'Amber') {
		return 'warning-preview';
	}

	return 'grey-preview';
}

function getApplyWarningText(viewModel: ChoiceEditorViewModel): string {
	if (viewModel.environment.safety === 'Red') {
		return 'Production-class environment detected. Review carefully before applying and publishing metadata changes.';
	}

	if (viewModel.environment.safety === 'Amber') {
		return 'Controlled non-production environment detected. Review staged changes before applying and publishing.';
	}

	return 'These changes are still staged locally. Dataverse metadata will only be changed when you choose Apply and publish.';
}

function renderRemovePendingButton(kind: string, value: number | undefined): string {
	if (typeof value !== 'number') {
		return '';
	}

	return `<button class="dv-small-button" data-command="removePendingChange" data-kind="${escapeHtml(kind)}" data-value="${escapeHtml(value)}">Remove</button>`;
}

function renderPendingChangeLine(change: ChoiceEditorViewModel['pendingChanges'][number]): string {
	if (change.kind === 'Add') {
		return `<div class="dv-pending-item"><span class="dv-pill success">Add</span><span>${escapeHtml(change.value ?? 'auto')} = ${escapeHtml(change.label)}</span>${renderRemovePendingButton(change.kind, change.value)}</div>`;
	}

	if (change.kind === 'UpdateLabel') {
		return `<div class="dv-pending-item"><span class="dv-pill warning">Update</span><span>${escapeHtml(change.value)}: ${escapeHtml(change.previousLabel)} → ${escapeHtml(change.nextLabel)}</span>${renderRemovePendingButton(change.kind, change.value)}</div>`;
	}

	return `<div class="dv-pending-item"><span class="dv-pill danger">Delete</span><span>${escapeHtml(change.value)} = ${escapeHtml(change.label)}</span>${renderRemovePendingButton(change.kind, change.value)}</div>`;
}


function renderUsageGroup(group: ChoiceUsageGroupViewModel): string {
	const itemHtml = group.items.length
		? group.items.map(item => `<li><strong>${escapeHtml(item.name)}</strong>${item.detail ? `<span class="dv-muted"> — ${escapeHtml(item.detail)}</span>` : ''}</li>`).join('')
		: '<li class="dv-muted">No potential usage found.</li>';

	const errorHtml = group.error
		? `<div class="dv-message Warning">Could not inspect this source: ${escapeHtml(group.error)}</div>`
		: '';

	return `<div class="dv-usage-group">
		<h3>${escapeHtml(group.kind)} <span class="dv-pill grey">${escapeHtml(group.items.length)}</span></h3>
		${errorHtml}
		<ul>${itemHtml}</ul>
	</div>`;
}

function renderPreviewOperation(change: ChoiceEditorViewModel['pendingChanges'][number]): string {
	if (change.kind === 'Add') {
		return `<div class="dv-preview-operation"><span class="dv-pill success">InsertOptionValue</span><div><strong>Add option value</strong><br><span>Value: ${escapeHtml(change.value ?? 'auto')}</span><br><span>Label: ${escapeHtml(change.label)}</span></div></div>`;
	}

	if (change.kind === 'UpdateLabel') {
		return `<div class="dv-preview-operation"><span class="dv-pill warning">UpdateOptionValue</span><div><strong>Update option label</strong><br><span>Value: ${escapeHtml(change.value)}</span><br><span>${escapeHtml(change.previousLabel)} → ${escapeHtml(change.nextLabel)}</span></div></div>`;
	}

	return `<div class="dv-preview-operation"><span class="dv-pill danger">DeleteOptionValue</span><div><strong>Delete option value</strong><br><span>Value: ${escapeHtml(change.value)}</span><br><span>Label: ${escapeHtml(change.label)}</span></div></div>`;
}
export function renderChoiceEditorHtml(viewModel: ChoiceEditorViewModel, options: RenderOptions): string {
	const nonDeletedValueCount = viewModel.values.filter(value => value.pendingState !== 'Deleted').length;
	const valuesRows = viewModel.values.length
		? viewModel.values.map(value => {
			const isDeleted = value.pendingState === 'Deleted';
			const canDelete = !isDeleted && nonDeletedValueCount > 1;
			const pendingClass = value.pendingState === 'Added'
				? 'success'
				: value.pendingState === 'Updated'
					? 'warning'
					: value.pendingState === 'Deleted'
						? 'danger'
						: '';

			return `
			<tr class="${value.pendingState !== 'Unchanged' ? 'dv-row-pending' : ''}">
				<td>${escapeHtml(value.value)}</td>
				<td>${escapeHtml(value.label)}</td>
				<td><span class="dv-pill ${value.status.toLowerCase()}">${escapeHtml(value.status)}</span></td>
				<td><span class="dv-pill ${pendingClass}">${escapeHtml(value.pendingState)}</span></td>
				<td>
					<button data-command="editValue" data-value="${escapeHtml(value.value)}"${isDeleted || viewModel.selectedTargetReadOnly ? ' disabled' : ''}>Edit</button>
					<button data-command="deleteValue" data-value="${escapeHtml(value.value)}"${canDelete && !viewModel.selectedTargetReadOnly ? '' : ' disabled'}>Delete</button>
				</td>
			</tr>`;
		}).join('')
		: `<tr><td colspan="5"><div class="dv-empty">Connect to Dataverse, then select a local choice column or global choice to load values.</div></td></tr>`;

	const pendingText = viewModel.pendingChanges.length
		? `${viewModel.pendingChanges.length} pending change(s)`
		: 'No pending changes.';

	const pendingRows = viewModel.pendingChanges.length
		? `<div class="dv-pending-list">${viewModel.pendingChanges.map(renderPendingChangeLine).join('')}</div>`
		: '';

	const hasSelectedChoice = viewModel.choiceScope === 'global' ? !!viewModel.selectedGlobalChoice : !!viewModel.selectedChoice;
	const canStageChanges = hasSelectedChoice && !viewModel.selectedTargetReadOnly;
	const hasPendingChanges = viewModel.pendingChanges.length > 0;
	const environmentPillClass = getEnvironmentPillClass(viewModel);
	const applyButtonClass = getApplyButtonClass(viewModel);
	const previewCardClass = getPreviewCardClass(viewModel);
	const applyWarningText = getApplyWarningText(viewModel);
	const previewHtml = viewModel.previewOpen && hasPendingChanges
		? `<section class="dv-card dv-section dv-preview-card ${previewCardClass}">
			<div class="dv-preview-header">
				<div>
					<div class="dv-kicker">Metadata update preview</div>
					<h2>Preview changes</h2>
					<p>Review staged choice metadata changes before applying them to Dataverse.</p>
				</div>
				<span class="dv-pill warning">Preview-first</span>
			</div>
			<div class="dv-preview-grid">
				<div><span>Environment</span><strong>${escapeHtml(viewModel.environment.label)}</strong><em>${escapeHtml(viewModel.environment.safetyLabel)}</em></div>
				<div><span>Scope</span><strong>${escapeHtml(viewModel.choiceScope)}</strong></div>
				<div><span>Choice target</span><strong>${escapeHtml(viewModel.choiceScope === 'global' ? (viewModel.selectedGlobalChoice?.displayName ?? viewModel.selectedGlobalChoice?.name ?? 'None') : (viewModel.selectedChoice?.displayName ?? viewModel.selectedChoice?.logicalName ?? 'None'))}</strong></div>
				<div><span>Publish target</span><strong>${escapeHtml(viewModel.choiceScope === 'global' ? (viewModel.selectedGlobalChoice?.name ?? '—') : (viewModel.selectedEntity?.logicalName ?? '—'))}</strong></div>
			</div>
			<h3>Pending operations</h3>
			<div class="dv-preview-operations">${viewModel.pendingChanges.map(renderPreviewOperation).join('')}</div>
			<div class="dv-preview-note">${escapeHtml(applyWarningText)}</div>
			<div class="dv-actions">
				<button data-command="cancelPreview">Cancel preview</button>
				<button data-command="applyAndPublish" class="${applyButtonClass}">Apply and publish</button>
			</div>
		</section>`
		: '';


	const usageHtml = hasSelectedChoice && viewModel.choiceScope === 'local'
		? `<section class="dv-card dv-section">
			<div class="dv-section-header">
				<div>
					<h2>Choice usage inspection</h2>
					<p>Inspect forms, views, personal views, and processes for potential references to the selected choice column.</p>
				</div>
				<button data-command="inspectUsage">Inspect usage</button>
			</div>
			<div class="dv-preview-note">Usage inspection searches metadata payloads for the selected choice column logical name. Results are potential references, not runtime certainty.</div>
			${viewModel.usageInspected ? `<div class="dv-usage-grid">${viewModel.usageGroups.map(renderUsageGroup).join('')}</div>` : '<div class="dv-empty">Run Inspect usage to search metadata references for this choice column.</div>'}
		</section>`
		: '';

	const messageHtml = viewModel.message
		? `<div class="dv-message ${escapeHtml(viewModel.message.kind)}">${escapeHtml(viewModel.message.text)}</div>`
		: '';
	const readOnlyHtml = viewModel.selectedTargetReadOnly && viewModel.selectedTargetReadOnlyReason
		? `<div class="dv-message Warning">${escapeHtml(viewModel.selectedTargetReadOnlyReason)}</div>`
		: '';

	const entityDisabled = viewModel.entities.length && viewModel.choiceScope === 'local' ? '' : ' disabled';
	const choiceDisabled = viewModel.choiceColumns.length && viewModel.choiceScope === 'local' ? '' : ' disabled';
	const globalChoiceDisabled = viewModel.globalChoices.length && viewModel.choiceScope === 'global' ? '' : ' disabled';

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${options.cspSource} data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${escapeHtml(viewModel.productName)}</title>
	<style>${choiceEditorStyles}</style>
</head>
<body>
	<main class="dv-shell">
		<section class="dv-hero">
			<div>
				<div class="dv-kicker">DV ForgeLab Utility</div>
				<h1>${escapeHtml(viewModel.productName)}</h1>
				<p class="dv-subtitle">${escapeHtml(viewModel.subtitle)}</p>
			</div>
			<div class="dv-logo-card" aria-hidden="true">
				<img src="${options.logoUri}" alt="DV ForgeLab" />
			</div>
		</section>

		<section class="dv-toolbar">
			<div class="dv-pill-row">
				<span class="dv-pill ${environmentPillClass}">${escapeHtml(viewModel.environment.label)}</span>
				<span class="dv-pill">Preview-first metadata updates</span>
				<span class="dv-pill">Local + global choices</span>
			</div>
			<div class="dv-actions">
				<button data-command="connect">Connect</button>
				<button data-command="changeEnvironment">Change environment</button>
				<button data-command="refresh">Refresh</button>
				<button data-command="openFeedback">Feedback</button>
			</div>
		</section>

		${messageHtml}
		${readOnlyHtml}

		<section class="dv-summary-grid" aria-label="Summary">
			<div class="dv-card highlight">
				<div class="dv-card-title">Local columns</div>
				<div class="dv-card-value">${escapeHtml(viewModel.summary.choiceColumnCount)}</div>
				<div class="dv-card-caption">For selected entity</div>
			</div>
			<div class="dv-card">
				<div class="dv-card-title">Values</div>
				<div class="dv-card-value">${escapeHtml(viewModel.summary.valueCount)}</div>
				<div class="dv-card-caption">Loaded choice values</div>
			</div>
			<div class="dv-card warning">
				<div class="dv-card-title">Pending changes</div>
				<div class="dv-card-value">${escapeHtml(viewModel.summary.pendingChangeCount)}</div>
				<div class="dv-card-caption">Staged locally before apply</div>
			</div>
			<div class="dv-card">
				<div class="dv-card-title">Target</div>
				<div class="dv-card-value">${escapeHtml(viewModel.summary.selectedTargetLabel)}</div>
				<div class="dv-card-caption">Current choice target</div>
			</div>
		</section>

		<section class="dv-card dv-section">
			<h2>Choice target</h2>
			<p>Select a local entity choice column or a global choice definition. Both paths reuse the same staging, preview, apply, publish, import, and export workflow.</p>
			<div class="dv-form-grid">
				<div class="dv-field">
					<label for="choiceScope">Scope</label>
					<select id="choiceScope">
						<option value="local"${viewModel.choiceScope === 'local' ? ' selected' : ''}>Local choice column</option>
						<option value="global"${viewModel.choiceScope === 'global' ? ' selected' : ''}>Global choice</option>
					</select>
				</div>
				<div class="dv-field">
					<label for="entity">Entity</label>
					<select id="entity"${entityDisabled}>${renderEntityOptions(viewModel.entities, viewModel.selectedEntity?.logicalName)}</select>
				</div>
				<div class="dv-field">
					<label for="choice">Choice column</label>
					<select id="choice"${choiceDisabled}>${renderChoiceOptions(viewModel.choiceColumns, viewModel.selectedChoice?.logicalName)}</select>
				</div>
				<div class="dv-field">
					<label for="globalChoice">Global choice</label>
					<select id="globalChoice"${globalChoiceDisabled}>${renderGlobalChoiceOptions(viewModel.globalChoices, viewModel.selectedGlobalChoice?.name)}</select>
				</div>
			</div>
		</section>

		<section class="dv-section">
			<h2>Choice values</h2>
			<p>Values are displayed here after a choice column is selected. Edits will be staged locally before metadata is changed.</p>
			<div class="dv-table-wrap">
				<table>
					<thead>
						<tr>
							<th>Value</th>
							<th>Label</th>
							<th>Status</th>
							<th>Pending</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>${valuesRows}</tbody>
				</table>
			</div>
		</section>

		${usageHtml}

		<section class="dv-card dv-section">
			<h2>Pending changes</h2>
			<p>${escapeHtml(pendingText)}</p>
			${pendingRows}
			<div class="dv-actions">
				<button data-command="addValue"${canStageChanges ? '' : ' disabled'}>Add value</button>
				<button data-command="importJson"${hasSelectedChoice ? '' : ' disabled'}>Import JSON</button>
				<button data-command="exportJson"${hasSelectedChoice && viewModel.values.length ? '' : ' disabled'}>Export JSON</button>
				<button data-command="previewChanges"${hasPendingChanges && !viewModel.selectedTargetReadOnly ? '' : ' disabled'}>Preview changes</button>
				<button data-command="clearPendingChanges"${hasPendingChanges ? '' : ' disabled'}>Clear staged changes</button>
			</div>
		</section>

		${previewHtml}

		<div class="dv-footer-note">DV Choice Editor is part of the <a href="https://www.dvforgelab.com">DV ForgeLab</a> Dataverse tooling ecosystem. <a href="https://www.dvquickrun.com">DV Quick Run</a> is the flagship Dataverse investigation workbench.</div>
	</main>
	<script>${choiceEditorScript}</script>
</body>
</html>`;
}
