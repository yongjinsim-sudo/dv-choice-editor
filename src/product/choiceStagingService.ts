import { ChoiceValueViewModel, PendingChoiceChangeViewModel } from './choiceEditorTypes';
import { NormalizedChoiceDefinitionArtifactOperation, NormalizedChoiceDefinitionArtifactValue } from './choiceDefinitionArtifact';

export type ChoiceStageState = {
	values: ChoiceValueViewModel[];
	pendingChanges: PendingChoiceChangeViewModel[];
};

export type ImportStageSummary = {
	added: number;
	updated: number;	
	deleted: number;
	skipped: number;
};

export function getNextOptionValue(values: ChoiceValueViewModel[], pendingChanges: PendingChoiceChangeViewModel[]): number {
	const existingValues = values.map(value => value.value);
	const pendingValues = pendingChanges
		.filter((change): change is Extract<PendingChoiceChangeViewModel, { kind: 'Add' }> => change.kind === 'Add' && typeof change.value === 'number')
		.map(change => change.value as number);
	const maxValue = Math.max(999999, ...existingValues, ...pendingValues);
	return maxValue + 1;
}

export function stageImportedValues(state: ChoiceStageState, importedValues: NormalizedChoiceDefinitionArtifactValue[]): ImportStageSummary {
	const summary: ImportStageSummary = { added: 0, updated: 0, deleted: 0, skipped: 0 };

	for (const imported of importedValues) {
		const result = stageImportedValue(state, imported);
		summary[result] += 1;
	}

	state.values = state.values.sort((a, b) => a.value - b.value);
	return summary;
}


export function stageImportedOperations(state: ChoiceStageState, operations: NormalizedChoiceDefinitionArtifactOperation[]): ImportStageSummary {
	const summary: ImportStageSummary = { added: 0, updated: 0, deleted: 0, skipped: 0 };

	for (const operation of operations) {
		const result = stageImportedOperation(state, operation);
		summary[result] += 1;
	}

	state.values = state.values.sort((a, b) => a.value - b.value);
	return summary;
}

function stageImportedOperation(state: ChoiceStageState, operation: NormalizedChoiceDefinitionArtifactOperation): keyof ImportStageSummary {
	if (operation.kind === 'AddOption') {
		return stageImportedValue(state, { label: operation.label, value: operation.value });
	}

	if (operation.kind === 'UpdateLabel') {
		return stageImportedValue(state, { label: operation.nextLabel, value: operation.value });
	}

	const existing = state.values.find(value => value.value === operation.value && value.pendingState !== 'Deleted');
	if (!existing) {
		return 'skipped';
	}

	if (existing.pendingState === 'Added') {
		state.pendingChanges = state.pendingChanges.filter(change => !(change.kind === 'Add' && change.value === operation.value));
		state.values = state.values.filter(value => value.value !== operation.value);
		return 'deleted';
	}

	state.pendingChanges = state.pendingChanges.filter(change => !(change.kind === 'UpdateLabel' && change.value === operation.value));
	if (!state.pendingChanges.some(change => change.kind === 'Delete' && change.value === operation.value)) {
		state.pendingChanges.push({ kind: 'Delete', value: operation.value, label: existing.label });
	}
	existing.pendingState = 'Deleted';
	return 'deleted';
}

function stageImportedValue(state: ChoiceStageState, imported: NormalizedChoiceDefinitionArtifactValue): keyof ImportStageSummary {
	const importedLabel = imported.label.trim();
	const existingByValue = typeof imported.value === 'number'
		? state.values.find(value => value.value === imported.value)
		: undefined;
	const existingByLabel = state.values.find(value => value.label.toLowerCase() === importedLabel.toLowerCase() && value.pendingState !== 'Deleted');

	if (existingByValue) {
		if (existingByValue.label === importedLabel && existingByValue.pendingState !== 'Deleted') {
			return 'skipped';
		}

		const existingUpdate = state.pendingChanges.find(
			(change): change is Extract<PendingChoiceChangeViewModel, { kind: 'UpdateLabel' }> => change.kind === 'UpdateLabel' && change.value === existingByValue.value
		);
		if (existingUpdate) {
			existingUpdate.nextLabel = importedLabel;
		} else if (existingByValue.pendingState === 'Added') {
			const existingAdd = state.pendingChanges.find(
				(change): change is Extract<PendingChoiceChangeViewModel, { kind: 'Add' }> => change.kind === 'Add' && change.value === existingByValue.value
			);
			if (existingAdd) {
				existingAdd.label = importedLabel;
			}
		} else {
			state.pendingChanges = state.pendingChanges.filter(change => !(change.kind === 'Delete' && change.value === existingByValue.value));
			state.pendingChanges.push({
				kind: 'UpdateLabel',
				value: existingByValue.value,
				previousLabel: existingByValue.label,
				nextLabel: importedLabel
			});
		}

		existingByValue.label = importedLabel;
		existingByValue.pendingState = existingByValue.pendingState === 'Added' ? 'Added' : 'Updated';
		return 'updated';
	}

	if (existingByLabel) {
		return 'skipped';
	}

	const value = typeof imported.value === 'number' ? imported.value : getNextOptionValue(state.values, state.pendingChanges);
	const alreadyReserved = state.values.some(item => item.value === value) ||
		state.pendingChanges.some(change => change.kind === 'Add' && change.value === value);
	if (alreadyReserved) {
		return 'skipped';
	}

	state.pendingChanges.push({ kind: 'Add', value, label: importedLabel });
	state.values.push({
		value,
		label: importedLabel,
		status: 'Custom',
		pendingState: 'Added'
	});
	return 'added';
}
