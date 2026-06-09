import * as vscode from 'vscode';
import { ChoiceMetadataClient } from '../dataverse/choiceMetadataClient';
import { ChoiceMutationClient } from '../dataverse/choiceMutationClient';
import { ChoiceUsageClient } from '../dataverse/choiceUsageClient';
import { DataverseConnection, getDataverseConnection } from '../dataverse/dataverseConnection';
import { ChoiceEditorState, createInitialChoiceEditorState } from '../product/choiceEditorState';
import { buildChoiceEditorViewModel } from '../product/choiceEditorViewModelBuilder';
import { ChoiceValueViewModel, PendingChoiceChangeViewModel } from '../product/choiceEditorTypes';
import { renderChoiceEditorHtml } from '../webview/renderChoiceEditorHtml';

const panelTitle = 'DV Choice Editor';

type WebviewMessage = {
	command?: string;
	payload?: Record<string, unknown>;
};

function toChoiceValueViewModel(value: { value: number; label: string; status?: 'System' | 'Managed' | 'Custom' | 'Unknown' }): ChoiceValueViewModel {
	return {
		value: value.value,
		label: value.label,
		status: value.status ?? 'Unknown',
		pendingState: 'Unchanged'
	};
}

export async function openChoiceEditorCommand(context: vscode.ExtensionContext): Promise<void> {
	let connection: DataverseConnection | undefined;
	let metadataClient: ChoiceMetadataClient | undefined;
	let mutationClient: ChoiceMutationClient | undefined;
	let usageClient: ChoiceUsageClient | undefined;
	const state: ChoiceEditorState = createInitialChoiceEditorState();

	const panel = vscode.window.createWebviewPanel(
		'dvChoiceEditor',
		panelTitle,
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'images')]
		}
	);

	const logoUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'images', 'dv-utilities-icon-128.png'));

	function render(): void {
		panel.webview.html = renderChoiceEditorHtml(buildChoiceEditorViewModel(state), {
			logoUri: logoUri.toString(),
			cspSource: panel.webview.cspSource
		});
	}

	async function connect(forcePick = false): Promise<void> {
		try {
			state.message = { kind: 'Info', text: 'Connecting to Dataverse...' };
			render();

			connection = await getDataverseConnection(context, { forcePick });
			if (!connection) {
				state.message = { kind: 'Warning', text: 'Connection cancelled.' };
				render();
				return;
			}

			metadataClient = new ChoiceMetadataClient(connection.client);
			mutationClient = new ChoiceMutationClient(connection.client);
			usageClient = new ChoiceUsageClient(connection.client);
			state.environment = {
				label: connection.environmentLabel,
				url: connection.environmentUrl
			};
			state.entities = await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'DV Choice Editor: Loading Dataverse entities',
					cancellable: false
				},
				() => metadataClient!.listEntities()
			);
			state.choiceColumns = [];
			state.values = [];
			state.usageGroups = [];
			state.usageInspected = false;
			state.selectedEntityLogicalName = undefined;
			state.selectedChoiceLogicalName = undefined;
			state.pendingChanges = [];
			state.previewOpen = false;
			state.message = { kind: 'Info', text: `Connected to ${connection.environmentLabel}. ${state.entities.length} entities loaded.` };
			render();
		} catch (error) {
			state.message = { kind: 'Error', text: error instanceof Error ? error.message : String(error) };
			render();
		}
	}

	async function selectEntity(logicalName: string): Promise<void> {
		if (!metadataClient || !logicalName) {
			return;
		}

		try {
			state.selectedEntityLogicalName = logicalName;
			state.selectedChoiceLogicalName = undefined;
			state.choiceColumns = [];
			state.values = [];
			state.usageGroups = [];
			state.usageInspected = false;
			state.pendingChanges = [];
			state.previewOpen = false;
			state.message = { kind: 'Info', text: `Loading choice columns for ${logicalName}...` };
			render();

			state.choiceColumns = await metadataClient.listChoiceColumns(logicalName);
			state.message = {
				kind: 'Info',
				text: `${state.choiceColumns.length} choice column(s) loaded for ${logicalName}.`
			};
			render();
		} catch (error) {
			state.message = { kind: 'Error', text: error instanceof Error ? error.message : String(error) };
			render();
		}
	}

	async function selectChoice(logicalName: string): Promise<void> {
		if (!metadataClient || !state.selectedEntityLogicalName || !logicalName) {
			return;
		}

		try {
			state.selectedChoiceLogicalName = logicalName;
			state.values = [];
			state.usageGroups = [];
			state.usageInspected = false;
			state.pendingChanges = [];
			state.previewOpen = false;
			state.message = { kind: 'Info', text: `Loading values for ${logicalName}...` };
			render();

			const values = await metadataClient.listChoiceValues(state.selectedEntityLogicalName, logicalName);
			state.values = values.map(toChoiceValueViewModel);
			state.message = {
				kind: 'Info',
				text: `${state.values.length} value(s) loaded for ${logicalName}.`
			};
			render();
		} catch (error) {
			state.message = { kind: 'Error', text: error instanceof Error ? error.message : String(error) };
			render();
		}
	}


	async function inspectUsage(): Promise<void> {
		if (!usageClient || !state.selectedEntityLogicalName || !state.selectedChoiceLogicalName) {
			state.message = { kind: 'Warning', text: 'Select an entity and choice column before inspecting usage.' };
			render();
			return;
		}

		try {
			state.message = { kind: 'Info', text: `Inspecting potential usage for ${state.selectedChoiceLogicalName}...` };
			state.usageGroups = [];
			state.usageInspected = false;
			render();

			state.usageGroups = await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'DV Choice Editor: Inspecting potential choice usage',
					cancellable: false
				},
				() => usageClient!.inspectUsage(state.selectedEntityLogicalName!, state.selectedChoiceLogicalName!)
			);
			state.usageInspected = true;

			const totalMatches = state.usageGroups.reduce((sum, group) => sum + group.items.length, 0);
			state.message = {
				kind: 'Info',
				text: totalMatches
					? `${totalMatches} potential usage reference(s) found for ${state.selectedChoiceLogicalName}.`
					: `No potential usage references found for ${state.selectedChoiceLogicalName}.`
			};
			render();
		} catch (error) {
			state.message = { kind: 'Error', text: error instanceof Error ? error.message : String(error) };
			render();
		}
	}

	function getNextOptionValue(): number {
		const existingValues = state.values.map(value => value.value);
		const pendingValues = state.pendingChanges
			.filter((change): change is Extract<PendingChoiceChangeViewModel, { kind: 'Add' }> => change.kind === 'Add' && typeof change.value === 'number')
			.map(change => change.value as number);
		const maxValue = Math.max(999999, ...existingValues, ...pendingValues);
		return maxValue + 1;
	}

	async function addValue(): Promise<void> {
		if (!state.selectedEntityLogicalName || !state.selectedChoiceLogicalName) {
			state.message = { kind: 'Warning', text: 'Select an entity and choice column before adding a value.' };
			render();
			return;
		}

		const label = await vscode.window.showInputBox({
			prompt: 'Enter new choice label',
			placeHolder: 'New choice label',
			ignoreFocusOut: true,
			validateInput: (value: string) => value.trim() ? undefined : 'Label is required.'
		});

		if (!label) {
			return;
		}

		const defaultValue = String(getNextOptionValue());
		const rawValue = await vscode.window.showInputBox({
			prompt: 'Enter option value',
			placeHolder: defaultValue,
			value: defaultValue,
			ignoreFocusOut: true,
			validateInput: (value: string) => {
				if (!/^\d+$/.test(value.trim())) {
					return 'Option value must be a whole number.';
				}

				const numeric = Number(value.trim());
				const alreadyExists = state.values.some(item => item.value === numeric) ||
					state.pendingChanges.some(change => change.kind === 'Add' && change.value === numeric);
				return alreadyExists ? `Option value ${numeric} already exists.` : undefined;
			}
		});

		if (!rawValue) {
			return;
		}

		const value = Number(rawValue.trim());
		const trimmedLabel = label.trim();
		state.previewOpen = false;
		state.pendingChanges.push({ kind: 'Add', value, label: trimmedLabel });
		state.values.push({
			value,
			label: trimmedLabel,
			status: 'Custom',
			pendingState: 'Added'
		});
		state.values = state.values.sort((a, b) => a.value - b.value);
		state.message = { kind: 'Info', text: `Staged new value ${value} for ${state.selectedChoiceLogicalName}.` };
		render();
	}

	function findValue(value: number): ChoiceValueViewModel | undefined {
		return state.values.find(item => item.value === value);
	}

	function getNonDeletedValueCount(): number {
		return state.values.filter(item => item.pendingState !== 'Deleted').length;
	}

	async function editValue(rawValue: string): Promise<void> {
		const value = Number(rawValue);
		const target = findValue(value);
		if (!Number.isFinite(value) || !target || target.pendingState === 'Deleted') {
			state.message = { kind: 'Warning', text: 'Select an editable choice value first.' };
			render();
			return;
		}

		const nextLabel = await vscode.window.showInputBox({
			prompt: `Edit label for value ${value}`,
			placeHolder: target.label,
			value: target.label,
			ignoreFocusOut: true,
			validateInput: (input: string) => input.trim() ? undefined : 'Label is required.'
		});

		if (!nextLabel) {
			return;
		}

		const trimmed = nextLabel.trim();
		if (trimmed === target.label) {
			state.message = { kind: 'Info', text: `No label change staged for ${value}.` };
			render();
			return;
		}

		state.previewOpen = false;
		if (target.pendingState === 'Added') {
			const addChange = state.pendingChanges.find(
				(change): change is Extract<PendingChoiceChangeViewModel, { kind: 'Add' }> => change.kind === 'Add' && change.value === value
			);
			if (addChange) {
				addChange.label = trimmed;
			}
			target.label = trimmed;
			state.message = { kind: 'Info', text: `Updated staged new value ${value}.` };
			render();
			return;
		}

		const existingUpdate = state.pendingChanges.find(
			(change): change is Extract<PendingChoiceChangeViewModel, { kind: 'UpdateLabel' }> => change.kind === 'UpdateLabel' && change.value === value
		);
		if (existingUpdate) {
			existingUpdate.nextLabel = trimmed;
		} else {
			state.pendingChanges.push({
				kind: 'UpdateLabel',
				value,
				previousLabel: target.label,
				nextLabel: trimmed
			});
		}

		target.label = trimmed;
		target.pendingState = 'Updated';
		state.message = { kind: 'Info', text: `Staged label update for value ${value}.` };
		render();
	}

	async function deleteValue(rawValue: string): Promise<void> {
		const value = Number(rawValue);
		const target = findValue(value);
		if (!Number.isFinite(value) || !target || target.pendingState === 'Deleted') {
			state.message = { kind: 'Warning', text: 'Select a deletable choice value first.' };
			render();
			return;
		}

		if (getNonDeletedValueCount() <= 1) {
			state.message = { kind: 'Warning', text: 'Cannot delete the last remaining choice value.' };
			render();
			return;
		}

		state.previewOpen = false;
		if (target.pendingState === 'Added') {
			state.pendingChanges = state.pendingChanges.filter(change => !(change.kind === 'Add' && change.value === value));
			state.values = state.values.filter(item => item.value !== value);
			state.message = { kind: 'Info', text: `Removed staged new value ${value}.` };
			render();
			return;
		}

		const confirmed = await vscode.window.showWarningMessage(
			`Stage delete for ${value} = ${target.label}? Dataverse will not be changed until Preview changes → Apply and publish.`,
			{ modal: true },
			'Stage delete'
		);

		if (confirmed !== 'Stage delete') {
			return;
		}

		state.pendingChanges = state.pendingChanges.filter(change => !(change.kind === 'UpdateLabel' && change.value === value));
		if (!state.pendingChanges.some(change => change.kind === 'Delete' && change.value === value)) {
			state.pendingChanges.push({ kind: 'Delete', value, label: target.label });
		}
		target.pendingState = 'Deleted';
		state.message = { kind: 'Info', text: `Staged delete for value ${value}.` };
		render();
	}

	function removePendingChange(kind: string, rawValue: string): void {
		const value = Number(rawValue);
		if (!Number.isFinite(value)) {
			state.message = { kind: 'Warning', text: 'Could not identify the staged change to remove.' };
			render();
			return;
		}

		const change = state.pendingChanges.find(item => item.kind === kind && 'value' in item && item.value === value);
		if (!change) {
			state.message = { kind: 'Warning', text: 'The staged change was not found.' };
			render();
			return;
		}

		state.previewOpen = false;
		state.pendingChanges = state.pendingChanges.filter(item => !(item.kind === kind && 'value' in item && item.value === value));

		if (kind === 'Add') {
			state.values = state.values.filter(item => item.value !== value);
			state.message = { kind: 'Info', text: `Removed staged add for value ${value}.` };
			render();
			return;
		}

		const target = findValue(value);
		if (target && kind === 'UpdateLabel' && change.kind === 'UpdateLabel') {
			target.label = change.previousLabel;
			target.pendingState = 'Unchanged';
			state.message = { kind: 'Info', text: `Removed staged label update for value ${value}.` };
			render();
			return;
		}

		if (target && kind === 'Delete') {
			target.pendingState = 'Unchanged';
			state.message = { kind: 'Info', text: `Removed staged delete for value ${value}.` };
			render();
			return;
		}

		state.message = { kind: 'Info', text: `Removed staged ${kind} change for value ${value}.` };
		render();
	}

	function clearPendingChanges(): void {
		if (!state.pendingChanges.length) {
			state.message = { kind: 'Info', text: 'No pending changes to clear.' };
			render();
			return;
		}

		for (const change of state.pendingChanges) {
			if (change.kind === 'Add' && typeof change.value === 'number') {
				state.values = state.values.filter(item => item.value !== change.value);
				continue;
			}

			const target = state.values.find(item => item.value === change.value);
			if (!target) {
				continue;
			}

			if (change.kind === 'UpdateLabel') {
				target.label = change.previousLabel;
			}

			target.pendingState = 'Unchanged';
		}

		state.pendingChanges = [];
		state.previewOpen = false;
		state.values = state.values.sort((a, b) => a.value - b.value);
		state.message = { kind: 'Info', text: 'Cleared all staged choice changes.' };
		render();
	}

	async function previewChanges(): Promise<void> {
		if (!state.selectedEntityLogicalName || !state.selectedChoiceLogicalName || !state.pendingChanges.length) {
			state.message = { kind: 'Warning', text: 'No pending changes to preview.' };
			state.previewOpen = false;
			render();
			return;
		}

		state.previewOpen = true;
		state.message = { kind: 'Info', text: `Previewing ${state.pendingChanges.length} pending change(s) for ${state.selectedChoiceLogicalName}.` };
		render();
	}

	function cancelPreview(): void {
		state.previewOpen = false;
		state.message = { kind: 'Info', text: 'Preview cancelled. Pending changes remain staged locally.' };
		render();
	}

	async function applyAndPublish(): Promise<void> {
		if (!mutationClient || !state.selectedEntityLogicalName || !state.selectedChoiceLogicalName || !state.pendingChanges.length) {
			state.message = { kind: 'Warning', text: 'No pending changes to apply.' };
			state.previewOpen = false;
			render();
			return;
		}

		if (!state.previewOpen) {
			await previewChanges();
			return;
		}

		try {
			state.message = { kind: 'Info', text: 'Applying choice metadata changes...' };
			render();

			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'DV Choice Editor: Applying and publishing choice changes',
					cancellable: false
				},
				async () => {
					await mutationClient!.applyChanges(
						state.selectedEntityLogicalName!,
						state.selectedChoiceLogicalName!,
						state.pendingChanges
					);
					await mutationClient!.publishEntity(state.selectedEntityLogicalName!);
				}
			);

			const appliedCount = state.pendingChanges.length;
			state.pendingChanges = [];
			state.previewOpen = false;
			state.message = {
				kind: 'Info',
				text: `${appliedCount} choice change(s) applied and ${state.selectedEntityLogicalName} published.`
			};
			await selectChoice(state.selectedChoiceLogicalName);
		} catch (error) {
			state.message = { kind: 'Error', text: error instanceof Error ? error.message : String(error) };
			render();
		}
	}

	async function changeEnvironment(): Promise<void> {
		await connect(true);
	}

	async function refresh(): Promise<void> {
		if (!connection) {
			await connect();
			return;
		}

		if (state.selectedChoiceLogicalName) {
			await selectChoice(state.selectedChoiceLogicalName);
			return;
		}

		if (state.selectedEntityLogicalName) {
			await selectEntity(state.selectedEntityLogicalName);
			return;
		}

		await connect();
	}

	panel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
		switch (message.command) {
			case 'connect':
				await connect(false);
				break;
			case 'changeEnvironment':
				await changeEnvironment();
				break;
			case 'refresh':
				await refresh();
				break;
			case 'selectEntity':
				await selectEntity(String(message.payload?.logicalName ?? ''));
				break;
			case 'selectChoice':
				await selectChoice(String(message.payload?.logicalName ?? ''));
				break;
			case 'addValue':
				await addValue();
				break;
			case 'inspectUsage':
				await inspectUsage();
				break;
			case 'editValue':
				await editValue(String(message.payload?.value ?? ''));
				break;
			case 'deleteValue':
				await deleteValue(String(message.payload?.value ?? ''));
				break;
			case 'removePendingChange':
				removePendingChange(String(message.payload?.kind ?? ''), String(message.payload?.value ?? ''));
				break;
			case 'clearPendingChanges':
				clearPendingChanges();
				break;
			case 'previewChanges':
				await previewChanges();
				break;
			case 'applyAndPublish':
				await applyAndPublish();
				break;
			case 'cancelPreview':
				cancelPreview();
				break;
			default:
				break;
		}
	});

	render();
}
