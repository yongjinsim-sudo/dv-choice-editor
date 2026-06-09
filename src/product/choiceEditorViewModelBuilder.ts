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
	const environmentSafety = classifyEnvironment(state.environment?.label, state.environment?.url);

	return {
		productName: 'DV Choice Editor',
		subtitle: 'Dataverse choice management inside VS Code.',
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
		entities: state.entities,
		choiceColumns: state.choiceColumns,
		selectedEntity,
		selectedChoice,
		summary: {
			choiceColumnCount: state.choiceColumns.length,
			valueCount: state.values.length,
			pendingChangeCount: state.pendingChanges.length,
			selectedEntityLabel: selectedEntity?.displayName ?? selectedEntity?.logicalName ?? 'None'
		},
		values: state.values,
		pendingChanges: state.pendingChanges,
		previewOpen: state.previewOpen,
		message: state.message
	};
}

export function buildInitialChoiceEditorViewModel(): ChoiceEditorViewModel {
	return buildChoiceEditorViewModel({
		entities: [],
		choiceColumns: [],
		values: [],
		pendingChanges: [],
		previewOpen: false
	});
}
