export type ChoiceEditorEnvironmentViewModel = {
	label: string;
	url?: string;
	state: 'NotConnected' | 'Connected';
	safety: 'None' | 'Grey' | 'Amber' | 'Red';
	safetyLabel: string;
};

export type EntityViewModel = {
	logicalName: string;
	displayName?: string;
};

export type ChoiceColumnViewModel = {
	logicalName: string;
	displayName?: string;
	type: 'Picklist' | 'State' | 'Status' | 'MultiSelectPicklist';
};

export type ChoiceEditorSummaryViewModel = {
	choiceColumnCount: number;
	valueCount: number;
	pendingChangeCount: number;
	selectedEntityLabel: string;
};

export type ChoiceValueViewModel = {
	value: number;
	label: string;
	status: 'System' | 'Managed' | 'Custom' | 'Unknown';
	pendingState: 'Unchanged' | 'Added' | 'Updated' | 'Deleted';
};

export type PendingChoiceChangeViewModel =
	| { kind: 'Add'; label: string; value?: number }
	| { kind: 'UpdateLabel'; value: number; previousLabel: string; nextLabel: string }
	| { kind: 'Delete'; value: number; label: string };

export type ChoiceEditorViewModel = {
	productName: string;
	subtitle: string;
	environment: ChoiceEditorEnvironmentViewModel;
	entities: EntityViewModel[];
	choiceColumns: ChoiceColumnViewModel[];
	summary: ChoiceEditorSummaryViewModel;
	selectedEntity?: EntityViewModel;
	selectedChoice?: ChoiceColumnViewModel;
	values: ChoiceValueViewModel[];
	pendingChanges: PendingChoiceChangeViewModel[];
	previewOpen: boolean;
	message?: {
		kind: 'Info' | 'Warning' | 'Error';
		text: string;
	};
};
