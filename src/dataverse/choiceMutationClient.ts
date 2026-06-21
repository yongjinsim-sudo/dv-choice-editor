import { PendingChoiceChangeViewModel } from '../product/choiceEditorTypes';
import { ChoiceTarget } from '../product/choiceTargetTypes';
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

function buildPublishXml(target: ChoiceTarget): string {
	if (target.scope === 'local') {
		return `<importexportxml><entities><entity>${target.entityLogicalName}</entity></entities></importexportxml>`;
	}

	return `<importexportxml><optionsets><optionset>${target.optionSetName}</optionset></optionsets></importexportxml>`;
}

function buildOptionRequest(target: ChoiceTarget, base: Record<string, unknown>): Record<string, unknown> {
	if (target.scope === 'local') {
		return {
			EntityLogicalName: target.entityLogicalName,
			AttributeLogicalName: target.attributeLogicalName,
			...base
		};
	}

	return {
		OptionSetName: target.optionSetName,
		...base
	};
}

export class ChoiceMutationClient {
	constructor(private readonly client: DataverseHttpClient) {}

	async applyChanges(
		target: ChoiceTarget,
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
				const body: Record<string, unknown> = buildOptionRequest(target, {
					Label: buildLabel(change.label)
				});

				if (typeof change.value === 'number') {
					body.Value = change.value;
				}

				await this.client.post<InsertOptionValueResponse>('/InsertOptionValue', body);
				continue;
			}

			if (change.kind === 'UpdateLabel') {
				await this.client.post('/UpdateOptionValue', buildOptionRequest(target, {
					Value: change.value,
					Label: buildLabel(change.nextLabel),
					MergeLabels: true
				}));
				continue;
			}

			await this.client.post('/DeleteOptionValue', buildOptionRequest(target, {
				Value: change.value
			}));
		}

		return {
			success: true,
			message: `${changes.length} choice change(s) applied.`
		};
	}

	async publishTarget(target: ChoiceTarget): Promise<ChoiceMutationResult> {
		await this.client.post('/PublishXml', {
			ParameterXml: buildPublishXml(target)
		});

		return {
			success: true,
			message: target.scope === 'local' ? `${target.entityLogicalName} published.` : `${target.optionSetName} published.`
		};
	}

	async publishEntity(entityLogicalName: string): Promise<ChoiceMutationResult> {
		return this.publishTarget({ scope: 'local', entityLogicalName, attributeLogicalName: '' });
	}
}
