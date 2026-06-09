import { DataverseHttpClient } from './dataverseHttpClient';

type ODataCollection<T> = {
	value?: T[];
};

export type ChoiceUsageItem = {
	name: string;
	detail?: string;
};

export type ChoiceUsageGroup = {
	kind: 'Forms' | 'Views' | 'Personal Views' | 'Business Rules / Processes';
	items: ChoiceUsageItem[];
	error?: string;
};

type SystemFormRow = {
	name?: string;
	type?: number;
	formxml?: string;
	objecttypecode?: string;
};

type SavedQueryRow = {
	name?: string;
	fetchxml?: string;
	layoutxml?: string;
	returnedtypecode?: string;
};

type UserQueryRow = {
	name?: string;
	fetchxml?: string;
	layoutxml?: string;
	returnedtypecode?: string;
};

type WorkflowRow = {
	name?: string;
	category?: number;
	type?: number;
	primaryentity?: string;
	clientdata?: string;
	xaml?: string;
	description?: string;
};

export class ChoiceUsageClient {
	public constructor(private readonly client: DataverseHttpClient) {}

	public async inspectUsage(entityLogicalName: string, choiceLogicalName: string): Promise<ChoiceUsageGroup[]> {
		const [forms, views, personalViews, workflows] = await Promise.all([
			this.inspectForms(entityLogicalName, choiceLogicalName),
			this.inspectViews(entityLogicalName, choiceLogicalName),
			this.inspectPersonalViews(entityLogicalName, choiceLogicalName),
			this.inspectWorkflows(entityLogicalName, choiceLogicalName)
		]);

		return [forms, views, personalViews, workflows];
	}

	private async inspectForms(entityLogicalName: string, choiceLogicalName: string): Promise<ChoiceUsageGroup> {
		try {
			const query = `/systemforms?$select=name,type,formxml,objecttypecode&$filter=objecttypecode eq '${escapeODataString(entityLogicalName)}'`;
			const response = await this.client.get<ODataCollection<SystemFormRow>>(query);
			const items = (response.value ?? [])
				.filter(row => containsText(row.formxml, choiceLogicalName))
				.map(row => ({
					name: row.name ?? '(Unnamed form)',
					detail: getFormTypeLabel(row.type)
				}));

			return { kind: 'Forms', items };
		} catch (error) {
			return { kind: 'Forms', items: [], error: toErrorMessage(error) };
		}
	}

	private async inspectViews(entityLogicalName: string, choiceLogicalName: string): Promise<ChoiceUsageGroup> {
		try {
			const query = `/savedqueries?$select=name,fetchxml,layoutxml,returnedtypecode&$filter=returnedtypecode eq '${escapeODataString(entityLogicalName)}'`;
			const response = await this.client.get<ODataCollection<SavedQueryRow>>(query);
			const items = (response.value ?? [])
				.filter(row => containsText(`${row.fetchxml ?? ''}\n${row.layoutxml ?? ''}`, choiceLogicalName))
				.map(row => ({
					name: row.name ?? '(Unnamed system view)',
					detail: 'System view'
				}));

			return { kind: 'Views', items };
		} catch (error) {
			return { kind: 'Views', items: [], error: toErrorMessage(error) };
		}
	}

	private async inspectPersonalViews(entityLogicalName: string, choiceLogicalName: string): Promise<ChoiceUsageGroup> {
		try {
			const query = `/userqueries?$select=name,fetchxml,layoutxml,returnedtypecode&$filter=returnedtypecode eq '${escapeODataString(entityLogicalName)}'`;
			const response = await this.client.get<ODataCollection<UserQueryRow>>(query);
			const items = (response.value ?? [])
				.filter(row => containsText(`${row.fetchxml ?? ''}\n${row.layoutxml ?? ''}`, choiceLogicalName))
				.map(row => ({
					name: row.name ?? '(Unnamed personal view)',
					detail: 'Personal view'
				}));

			return { kind: 'Personal Views', items };
		} catch (error) {
			return { kind: 'Personal Views', items: [], error: toErrorMessage(error) };
		}
	}

	private async inspectWorkflows(entityLogicalName: string, choiceLogicalName: string): Promise<ChoiceUsageGroup> {
		try {
			const query = `/workflows?$select=name,category,type,primaryentity,clientdata,xaml,description&$filter=primaryentity eq '${escapeODataString(entityLogicalName)}'`;
			const response = await this.client.get<ODataCollection<WorkflowRow>>(query);
			const items = (response.value ?? [])
				.filter(row => containsText(`${row.clientdata ?? ''}\n${row.xaml ?? ''}\n${row.description ?? ''}`, choiceLogicalName))
				.map(row => ({
					name: row.name ?? '(Unnamed process)',
					detail: getWorkflowLabel(row)
				}));

			return { kind: 'Business Rules / Processes', items };
		} catch (error) {
			return { kind: 'Business Rules / Processes', items: [], error: toErrorMessage(error) };
		}
	}
}

function containsText(source: string | undefined, needle: string): boolean {
	return (source ?? '').toLowerCase().includes(needle.toLowerCase());
}

function escapeODataString(value: string): string {
	return value.replace(/'/g, "''");
}

function getFormTypeLabel(type?: number): string {
	switch (type) {
		case 2:
			return 'Main form';
		case 5:
			return 'Mobile form';
		case 6:
			return 'Quick view form';
		case 7:
			return 'Quick create form';
		default:
			return typeof type === 'number' ? `Form type ${type}` : 'Form';
	}
}

function getWorkflowLabel(row: WorkflowRow): string {
	if (row.category === 2) {
		return 'Business rule';
	}

	if (row.category === 5) {
		return 'Modern flow / process';
	}

	if (row.type === 1) {
		return 'Definition';
	}

	return 'Workflow / process';
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
