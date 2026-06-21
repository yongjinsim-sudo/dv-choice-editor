import { ChoiceEditorState } from './choiceEditorState';
import { ChoiceEditorViewModel } from './choiceEditorTypes';

function classifyEnvironment(label?: string, url?: string): { safety: 'None' | 'Grey' | 'Amber' | 'Red'; safetyLabel: string } {
	const text = `${label ?? ''} ${url ?? ''}`.toLowerCase();

	if (!text.trim()) {
		return { safety: 'None', safetyLabel: 'No environment' };
	}

	if (/\b(prod|production|live)\b/.test(text)) {
		return { safety: 'Red', safetyLabel: 'Production environment' };
	}

	if (/\b(sit|uat|test|qa|preprod|pre-prod|staging|stage|perf|nonprod|non-prod|np)\b/.test(text)) {
		return { safety: 'Amber', safetyLabel: 'Non-production controlled environment' };
	}

	return { safety: 'Grey', safetyLabel: 'Development or unclassified environment' };
}

export function buildChoiceEditorViewModel(state: ChoiceEditorState): ChoiceEditorViewModel {
	const selectedEntity = state.entities.find(entity => entity.logicalName === state.selectedEntityLogicalName);
	const selectedChoice = state.choiceColumns.find(choice => choice.logicalName === state.selectedChoiceLogicalName);
	const selectedGlobalChoice = state.globalChoices.find(choice => choice.name === state.selectedGlobalChoiceName);
	const environmentSafety = classifyEnvironment(state.environment?.label, state.environment?.url);
	const selectedTargetLabel = state.choiceScope === 'global'
		? selectedGlobalChoice?.displayName ?? selectedGlobalChoice?.name ?? 'None'
		: selectedChoice?.displayName ?? selectedChoice?.logicalName ?? 'None';
	const selectedTargetReadOnly = state.choiceScope === 'global' && selectedGlobalChoice?.isCustomizable === false;
	const selectedTargetReadOnlyReason = selectedTargetReadOnly
		? 'This global choice is not customizable in the connected environment. DVCE can view, import-compare, and export it, but cannot stage or apply reconstruction changes.'
		: undefined;

	return {
		productName: 'DV Choice Editor',
		subtitle: 'Dataverse local and global choice management inside VS Code.',
		environment: state.environment
			? {
				label: state.environment.label,
				url: state.environment.url,
				state: 'Connected',
				safety: environmentSafety.safety,
				safetyLabel: environmentSafety.safetyLabel
			}
			: {
				label: 'No environment connected',
				state: 'NotConnected',
				safety: 'None',
				safetyLabel: 'No environment connected'
			},
		choiceScope: state.choiceScope,
		entities: state.entities,
		choiceColumns: state.choiceColumns,
		globalChoices: state.globalChoices,
		selectedEntity,
		selectedChoice,
		selectedGlobalChoice,
		selectedTargetReadOnly,
		selectedTargetReadOnlyReason,
		summary: {
			choiceColumnCount: state.choiceColumns.length,
			globalChoiceCount: state.globalChoices.length,
			valueCount: state.values.length,
			pendingChangeCount: state.pendingChanges.length,
			selectedTargetLabel
		},
		values: state.values,
		usageGroups: state.usageGroups,
		usageInspected: state.usageInspected,
		pendingChanges: state.pendingChanges,
		previewOpen: state.previewOpen,
		message: state.message
	};
}

export function buildInitialChoiceEditorViewModel(): ChoiceEditorViewModel {
	return buildChoiceEditorViewModel({
		choiceScope: 'local',
		entities: [],
		choiceColumns: [],
		globalChoices: [],
		values: [],
		usageGroups: [],
		usageInspected: false,
		pendingChanges: [],
		previewOpen: false
	});
}
