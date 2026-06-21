import { ChoiceColumnViewModel, ChoiceScope, ChoiceUsageGroupViewModel, ChoiceValueViewModel, EntityViewModel, GlobalChoiceViewModel, PendingChoiceChangeViewModel } from './choiceEditorTypes';
import { ChoiceTarget } from './choiceTargetTypes';

export type ChoiceEditorState = {
	environment?: {
		label: string;
		url: string;
	};
	choiceScope: ChoiceScope;
	entities: EntityViewModel[];
	choiceColumns: ChoiceColumnViewModel[];
	globalChoices: GlobalChoiceViewModel[];
	values: ChoiceValueViewModel[];
	usageGroups: ChoiceUsageGroupViewModel[];
	usageInspected: boolean;
	selectedEntityLogicalName?: string;
	selectedChoiceLogicalName?: string;
	selectedGlobalChoiceName?: string;
	pendingChanges: PendingChoiceChangeViewModel[];
	previewOpen: boolean;
	message?: {
		kind: 'Info' | 'Warning' | 'Error';
		text: string;
	};
};

export function getSelectedChoiceTarget(state: ChoiceEditorState): ChoiceTarget | undefined {
	if (state.choiceScope === 'global') {
		return state.selectedGlobalChoiceName
			? { scope: 'global', optionSetName: state.selectedGlobalChoiceName }
			: undefined;
	}

	if (!state.selectedEntityLogicalName || !state.selectedChoiceLogicalName) {
		return undefined;
	}

	return {
		scope: 'local',
		entityLogicalName: state.selectedEntityLogicalName,
		attributeLogicalName: state.selectedChoiceLogicalName
	};
}

export function createInitialChoiceEditorState(): ChoiceEditorState {
	return {
		choiceScope: 'local',
		entities: [],
		choiceColumns: [],
		globalChoices: [],
		values: [],
		usageGroups: [],
		usageInspected: false,
		pendingChanges: [],
		previewOpen: false
	};
}
