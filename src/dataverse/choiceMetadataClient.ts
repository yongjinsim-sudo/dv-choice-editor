import { DataverseHttpClient } from './dataverseHttpClient';

export type EntityChoiceColumn = {
	logicalName: string;
	displayName?: string;
	type: 'Picklist' | 'State' | 'Status' | 'MultiSelectPicklist';
};

export type ChoiceOptionValue = {
	value: number;
	label: string;
	status?: 'System' | 'Managed' | 'Custom' | 'Unknown';
};

type ODataList<T> = {
	value?: T[];
};

type EntityMetadataRow = {
	LogicalName?: string;
	EntitySetName?: string;
	DisplayName?: {
		UserLocalizedLabel?: {
			Label?: string;
		};
	};
};

type AttributeMetadataRow = {
	LogicalName?: string;
	AttributeType?: string;
	DisplayName?: {
		UserLocalizedLabel?: {
			Label?: string;
		};
	};
	OptionSet?: {
		Options?: OptionMetadataRow[];
		TrueOption?: OptionMetadataRow;
		FalseOption?: OptionMetadataRow;
	};
	GlobalOptionSet?: {
		Options?: OptionMetadataRow[];
	};
};

type OptionMetadataRow = {
	Value?: number;
	IsManaged?: boolean;
	Label?: {
		UserLocalizedLabel?: {
			Label?: string;
		};
	};
};

function encodeLogicalName(value: string): string {
	return value.replace(/'/g, "''");
}

function getDisplayLabel(row: { DisplayName?: { UserLocalizedLabel?: { Label?: string } } }, fallback?: string): string | undefined {
	return row.DisplayName?.UserLocalizedLabel?.Label?.trim() || fallback;
}

function getOptionLabel(row: OptionMetadataRow): string {
	return row.Label?.UserLocalizedLabel?.Label?.trim() || '(no label)';
}

function distinctByLogicalName<T extends { logicalName: string }>(items: T[]): T[] {
	const seen = new Set<string>();
	const result: T[] = [];
	for (const item of items) {
		const key = item.logicalName.toLowerCase();
		if (!seen.has(key)) {
			seen.add(key);
			result.push(item);
		}
	}

	return result;
}

function normalizeChoiceType(attributeType?: string): EntityChoiceColumn['type'] | undefined {
	switch ((attributeType ?? '').trim().toLowerCase()) {
		case 'picklist':
			return 'Picklist';
		case 'state':
			return 'State';
		case 'status':
			return 'Status';
		case 'multiselectpicklist':
		case 'multipicklist':
			return 'MultiSelectPicklist';
		default:
			return undefined;
	}
}

function mapAttribute(row: AttributeMetadataRow): EntityChoiceColumn | undefined {
	const logicalName = row.LogicalName?.trim();
	const type = normalizeChoiceType(row.AttributeType);
	if (!logicalName || !type) {
		return undefined;
	}

	return {
		logicalName,
		displayName: getDisplayLabel(row, logicalName),
		type
	};
}

function inferOptionStatus(row: OptionMetadataRow): ChoiceOptionValue['status'] {
	if (typeof row.Value === 'number' && row.Value < 100000) {
		return 'System';
	}

	if (row.IsManaged === true) {
		return 'Managed';
	}

	return 'Custom';
}

function mapOptions(rows: OptionMetadataRow[] | undefined): ChoiceOptionValue[] {
	return (rows ?? [])
		.map((row): ChoiceOptionValue | undefined => {
			if (typeof row.Value !== 'number') {
				return undefined;
			}

			return {
				value: row.Value,
				label: getOptionLabel(row),
				status: inferOptionStatus(row)
			};
		})
		.filter((item): item is ChoiceOptionValue => !!item)
		.sort((a, b) => a.value - b.value);
}

export class ChoiceMetadataClient {
	constructor(private readonly client: DataverseHttpClient) {}

	async listEntities(): Promise<Array<{ logicalName: string; displayName?: string }>> {
		const response = await this.client.get<ODataList<EntityMetadataRow>>(
			'/EntityDefinitions?$select=LogicalName,EntitySetName,DisplayName'
		);

		const entities: Array<{ logicalName: string; displayName?: string }> = [];
		for (const row of response.value ?? []) {
			const logicalName = row.LogicalName?.trim();
			if (logicalName && row.EntitySetName?.trim()) {
				entities.push({
					logicalName,
					displayName: getDisplayLabel(row, logicalName)
				});
			}
		}

		return entities.sort((a, b) =>
			(a.displayName ?? a.logicalName).localeCompare(b.displayName ?? b.logicalName, undefined, { sensitivity: 'base' })
		);
	}

	async listChoiceColumns(entityLogicalName: string): Promise<EntityChoiceColumn[]> {
		const safeLogicalName = encodeLogicalName(entityLogicalName);
		const paths = [
			`/EntityDefinitions(LogicalName='${safeLogicalName}')/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName,AttributeType,DisplayName&$top=5000`,
			`/EntityDefinitions(LogicalName='${safeLogicalName}')/Attributes/Microsoft.Dynamics.CRM.MultiSelectPicklistAttributeMetadata?$select=LogicalName,AttributeType,DisplayName&$top=5000`,
			`/EntityDefinitions(LogicalName='${safeLogicalName}')/Attributes/Microsoft.Dynamics.CRM.StateAttributeMetadata?$select=LogicalName,AttributeType,DisplayName&$top=5000`,
			`/EntityDefinitions(LogicalName='${safeLogicalName}')/Attributes/Microsoft.Dynamics.CRM.StatusAttributeMetadata?$select=LogicalName,AttributeType,DisplayName&$top=5000`
		];

		const allRows: AttributeMetadataRow[] = [];
		for (const path of paths) {
			try {
				const response = await this.client.get<ODataList<AttributeMetadataRow>>(path);
				allRows.push(...(response.value ?? []));
			} catch {
				// Some metadata casts may fail depending on environment/version; continue with the others.
			}
		}

		return distinctByLogicalName(
			allRows
				.map(mapAttribute)
				.filter((item): item is EntityChoiceColumn => !!item)
		).sort((a, b) => (a.displayName ?? a.logicalName).localeCompare(b.displayName ?? b.logicalName, undefined, { sensitivity: 'base' }));
	}

	async listChoiceValues(entityLogicalName: string, choiceLogicalName: string): Promise<ChoiceOptionValue[]> {
		const safeEntity = encodeLogicalName(entityLogicalName);
		const safeChoice = encodeLogicalName(choiceLogicalName);
		const paths = [
			`/EntityDefinitions(LogicalName='${safeEntity}')/Attributes(LogicalName='${safeChoice}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName,AttributeType&$expand=OptionSet,GlobalOptionSet`,
			`/EntityDefinitions(LogicalName='${safeEntity}')/Attributes(LogicalName='${safeChoice}')/Microsoft.Dynamics.CRM.MultiSelectPicklistAttributeMetadata?$select=LogicalName,AttributeType&$expand=OptionSet,GlobalOptionSet`,
			`/EntityDefinitions(LogicalName='${safeEntity}')/Attributes(LogicalName='${safeChoice}')/Microsoft.Dynamics.CRM.StateAttributeMetadata?$select=LogicalName,AttributeType&$expand=OptionSet`,
			`/EntityDefinitions(LogicalName='${safeEntity}')/Attributes(LogicalName='${safeChoice}')/Microsoft.Dynamics.CRM.StatusAttributeMetadata?$select=LogicalName,AttributeType&$expand=OptionSet`
		];

		let lastError: unknown;
		for (const path of paths) {
			try {
				const row = await this.client.get<AttributeMetadataRow>(path);
				const options = row.OptionSet?.Options ?? row.GlobalOptionSet?.Options ?? [];

				const mapped = mapOptions(options);
				if (mapped.length) {
					return mapped;
				}
			} catch (error) {
				lastError = error;
			}
		}

		if (lastError instanceof Error) {
			throw lastError;
		}

		return [];
	}
}
