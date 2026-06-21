export type ChoiceEditorEnvironmentViewModel = {
	label: string;
	url?: string;
	state: 'NotConnected' | 'Connected';
	safety: 'None' | 'Grey' | 'Amber' | 'Red';
	safetyLabel: string;
};

export type ChoiceScope = 'local' | 'global';

export type EntityViewModel = {
	logicalName: string;
	displayName?: string;
};

export type ChoiceColumnViewModel = {
	logicalName: string;
	displayName?: string;
	type: 'Picklist' | 'State' | 'Status' | 'MultiSelectPicklist';
};

export type GlobalChoiceViewModel = {
	name: string;
	displayName?: string;
	type?: string;
	isCustomizable?: boolean;
};

export type ChoiceEditorSummaryViewModel = {
	choiceColumnCount: number;
	globalChoiceCount: number;
	valueCount: number;
	pendingChangeCount: number;
	selectedTargetLabel: string;
};

export type ChoiceValueViewModel = {
	value: number;
	label: string;
	status: 'System' | 'Managed' | 'Custom' | 'Unknown';
	pendingState: 'Unchanged' | 'Added' | 'Updated' | 'Deleted';
};

export type ChoiceUsageItemViewModel = {
	name: string;
	detail?: string;
};

export type ChoiceUsageGroupViewModel = {
	kind: 'Forms' | 'Views' | 'Personal Views' | 'Business Rules / Processes';
	items: ChoiceUsageItemViewModel[];
	error?: string;
};

export type PendingChoiceChangeViewModel =
	| { kind: 'Add'; label: string; value?: number }
	| { kind: 'UpdateLabel'; value: number; previousLabel: string; nextLabel: string }
	| { kind: 'Delete'; value: number; label: string };

export type ChoiceEditorViewModel = {
	productName: string;
	subtitle: string;
	environment: ChoiceEditorEnvironmentViewModel;
	choiceScope: ChoiceScope;
	entities: EntityViewModel[];
	choiceColumns: ChoiceColumnViewModel[];
	globalChoices: GlobalChoiceViewModel[];
	summary: ChoiceEditorSummaryViewModel;
	selectedEntity?: EntityViewModel;
	selectedChoice?: ChoiceColumnViewModel;
	selectedGlobalChoice?: GlobalChoiceViewModel;
	selectedTargetReadOnly: boolean;
	selectedTargetReadOnlyReason?: string;
	values: ChoiceValueViewModel[];
	usageGroups: ChoiceUsageGroupViewModel[];
	usageInspected: boolean;
	pendingChanges: PendingChoiceChangeViewModel[];
	previewOpen: boolean;
	message?: {
		kind: 'Info' | 'Warning' | 'Error';
		text: string;
	};
};
