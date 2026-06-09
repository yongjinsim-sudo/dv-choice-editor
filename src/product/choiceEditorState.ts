import { ChoiceColumnViewModel, ChoiceUsageGroupViewModel, ChoiceValueViewModel, EntityViewModel, PendingChoiceChangeViewModel } from './choiceEditorTypes';

export type ChoiceEditorState = {
	environment?: {
		label: string;
		url: string;
	};
	entities: EntityViewModel[];
	choiceColumns: ChoiceColumnViewModel[];
	values: ChoiceValueViewModel[];
	usageGroups: ChoiceUsageGroupViewModel[];
	usageInspected: boolean;
	selectedEntityLogicalName?: string;
	selectedChoiceLogicalName?: string;
	pendingChanges: PendingChoiceChangeViewModel[];
	previewOpen: boolean;
	message?: {
		kind: 'Info' | 'Warning' | 'Error';
		text: string;
	};
};

export function createInitialChoiceEditorState(): ChoiceEditorState {
	return {
		entities: [],
		choiceColumns: [],
		values: [],
		usageGroups: [],
		usageInspected: false,
		pendingChanges: [],
		previewOpen: false
	};
}
