import { ChoiceTarget } from './choiceTargetTypes';
import { ChoiceValueViewModel } from './choiceEditorTypes';

export type ChoiceDefinitionArtifactValue = {
	label: string;
	value?: number | string;
};

export type ChoiceDefinitionArtifact = {
	artifactType?: string;
	version?: string;
	scope?: 'local' | 'global';
	entityLogicalName?: string;
	attributeLogicalName?: string;
	optionSetName?: string;
	displayName?: string;
	values?: ChoiceDefinitionArtifactValue[];
};

export type NormalizedChoiceDefinitionArtifactValue = {
	label: string;
	value?: number;
};

export type NormalizedChoiceDefinitionArtifact = {
	artifactType: 'dvce.choiceDefinition';
	version: '1.0' | '2.0' | string;
	target?: ChoiceTarget;
	displayName?: string;
	values: NormalizedChoiceDefinitionArtifactValue[];
};

export function buildChoiceDefinitionArtifact(
	target: ChoiceTarget,
	values: ChoiceValueViewModel[],
	displayName?: string
): ChoiceDefinitionArtifact {
	const artifact: ChoiceDefinitionArtifact = {
		artifactType: 'dvce.choiceDefinition',
		version: '2.0',
		scope: target.scope,
		displayName,
		values: values
			.filter(value => value.pendingState !== 'Deleted')
			.sort((a, b) => a.value - b.value)
			.map(value => ({
				label: value.label,
				value: value.value
			}))
	};

	if (target.scope === 'local') {
		artifact.entityLogicalName = target.entityLogicalName;
		artifact.attributeLogicalName = target.attributeLogicalName;
	} else {
		artifact.optionSetName = target.optionSetName;
	}

	return artifact;
}

export function normalizeChoiceDefinitionArtifact(raw: unknown): NormalizedChoiceDefinitionArtifact {
	if (!raw || typeof raw !== 'object') {
		throw new Error('Invalid DVCE definition file. Expected a JSON object.');
	}

	const candidate = raw as ChoiceDefinitionArtifact;
	if (candidate.artifactType && candidate.artifactType !== 'dvce.choiceDefinition') {
		throw new Error(`Unsupported artifact type ${candidate.artifactType}. Expected dvce.choiceDefinition.`);
	}

	if (!Array.isArray(candidate.values)) {
		throw new Error('Invalid DVCE definition file. Expected a values array.');
	}

	const scope = candidate.scope ?? (candidate.optionSetName ? 'global' : 'local');
	let target: ChoiceTarget | undefined;
	if (scope === 'global') {
		if (candidate.optionSetName?.trim()) {
			target = {
				scope: 'global',
				optionSetName: candidate.optionSetName.trim()
			};
		}
	} else if (candidate.entityLogicalName?.trim() || candidate.attributeLogicalName?.trim()) {
		if (!candidate.entityLogicalName?.trim() || !candidate.attributeLogicalName?.trim()) {
			throw new Error('Local choice definitions must include both entityLogicalName and attributeLogicalName when either target field is supplied.');
		}

		target = {
			scope: 'local',
			entityLogicalName: candidate.entityLogicalName.trim(),
			attributeLogicalName: candidate.attributeLogicalName.trim()
		};
	}

	return {
		artifactType: 'dvce.choiceDefinition',
		version: candidate.version ?? '1.0',
		target,
		displayName: candidate.displayName,
		values: candidate.values.map(toArtifactValue)
	};
}

function toArtifactValue(value: unknown, index: number): NormalizedChoiceDefinitionArtifactValue {
	if (!value || typeof value !== 'object') {
		throw new Error(`Invalid value at index ${index}. Expected an object with label and optional value.`);
	}

	const candidate = value as ChoiceDefinitionArtifactValue;
	const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
	if (!label) {
		throw new Error(`Invalid value at index ${index}. Label is required.`);
	}

	if (candidate.value === undefined || candidate.value === null || candidate.value === '') {
		return { label };
	}

	const numericValue = Number(candidate.value);
	if (!Number.isInteger(numericValue) || numericValue < 0) {
		throw new Error(`Invalid value for ${label}. Option value must be a non-negative whole number.`);
	}

	return { label, value: numericValue };
}
