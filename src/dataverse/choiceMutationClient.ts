import { PendingChoiceChangeViewModel } from '../product/choiceEditorTypes';
import { DataverseHttpClient } from './dataverseHttpClient';

export type ChoiceMutationResult = {
	success: boolean;
	message: string;
};

type InsertOptionValueResponse = {
	NewOptionValue?: number;
	newOptionValue?: number;
};

function buildLabel(label: string): unknown {
	return {
		LocalizedLabels: [
			{
				Label: label,
				LanguageCode: 1033
			}
		],
		UserLocalizedLabel: {
			Label: label,
			LanguageCode: 1033
		}
	};
}

function buildPublishXml(entityLogicalName: string): string {
	return `<importexportxml><entities><entity>${entityLogicalName}</entity></entities></importexportxml>`;
}

export class ChoiceMutationClient {
	constructor(private readonly client: DataverseHttpClient) {}

	async applyChanges(
		entityLogicalName: string,
		choiceLogicalName: string,
		changes: PendingChoiceChangeViewModel[]
	): Promise<ChoiceMutationResult> {
		if (!changes.length) {
			return {
				success: true,
				message: 'No choice changes to apply.'
			};
		}

		for (const change of changes) {
			if (change.kind === 'Add') {
				const body: Record<string, unknown> = {
					EntityLogicalName: entityLogicalName,
					AttributeLogicalName: choiceLogicalName,
					Label: buildLabel(change.label)
				};

				if (typeof change.value === 'number') {
					body.Value = change.value;
				}

				await this.client.post<InsertOptionValueResponse>('/InsertOptionValue', body);
				continue;
			}

			if (change.kind === 'UpdateLabel') {
				await this.client.post('/UpdateOptionValue', {
					EntityLogicalName: entityLogicalName,
					AttributeLogicalName: choiceLogicalName,
					Value: change.value,
					Label: buildLabel(change.nextLabel),
					MergeLabels: true
				});
				continue;
			}

			await this.client.post('/DeleteOptionValue', {
				EntityLogicalName: entityLogicalName,
				AttributeLogicalName: choiceLogicalName,
				Value: change.value
			});
		}

		return {
			success: true,
			message: `${changes.length} choice change(s) applied.`
		};
	}

	async publishEntity(entityLogicalName: string): Promise<ChoiceMutationResult> {
		await this.client.post('/PublishXml', {
			ParameterXml: buildPublishXml(entityLogicalName)
		});

		return {
			success: true,
			message: `${entityLogicalName} published.`
		};
	}
}
