import { ChoiceColumnViewModel, ChoiceValueViewModel, EntityViewModel, PendingChoiceChangeViewModel } from './choiceEditorTypes';

export type ChoiceEditorState = {
	environment?: {
		label: string;
		url: string;
	};
	entities: EntityViewModel[];
	choiceColumns: ChoiceColumnViewModel[];
	values: ChoiceValueViewModel[];
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
		pendingChanges: [],
		previewOpen: false
	};
}
