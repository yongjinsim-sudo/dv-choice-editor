import { ChoiceTarget } from './choiceTargetTypes';
import { ChoiceValueViewModel } from './choiceEditorTypes';

export type ChoiceDefinitionArtifactValue = {
	label: string;
	value?: number | string;
};

export type ChoiceDefinitionArtifactOperation = {
	operation?: string;
	kind?: string;
	label?: string;
	value?: number | string;
	previousLabel?: string;
	nextLabel?: string;
};

export type ChoiceDefinitionArtifact = {
	artifactType?: string;
	version?: string;
	generatedBy?: string;
	generatedUtc?: string;
	sourceEnvironment?: string | { name?: string; url?: string };
	targetEnvironment?: string | { name?: string; url?: string };
	scope?: 'local' | 'global';
	entityLogicalName?: string;
	attributeLogicalName?: string;
	optionSetName?: string;
	displayName?: string;
	values?: ChoiceDefinitionArtifactValue[];
	operations?: ChoiceDefinitionArtifactOperation[];
};

export type NormalizedChoiceDefinitionArtifactValue = {
	label: string;
	value?: number;
};

export type NormalizedChoiceDefinitionArtifactOperation =
	| { kind: 'AddOption'; label: string; value?: number }
	| { kind: 'UpdateLabel'; value: number; previousLabel?: string; nextLabel: string }
	| { kind: 'DeleteOption'; value: number; label?: string };

export type NormalizedChoiceDefinitionArtifact = {
	artifactType: 'dvce.choiceDefinition';
	version: '1.0' | '2.0' | '3.0' | string;
	generatedBy?: string;
	generatedUtc?: string;
	sourceEnvironment?: ChoiceDefinitionArtifact['sourceEnvironment'];
	targetEnvironment?: ChoiceDefinitionArtifact['targetEnvironment'];
	target?: ChoiceTarget;
	displayName?: string;
	values: NormalizedChoiceDefinitionArtifactValue[];
	operations: NormalizedChoiceDefinitionArtifactOperation[];
};

export function buildChoiceDefinitionArtifact(
	target: ChoiceTarget,
	values: ChoiceValueViewModel[],
	displayName?: string
): ChoiceDefinitionArtifact {
	const artifact: ChoiceDefinitionArtifact = {
		artifactType: 'dvce.choiceDefinition',
		version: '3.0',
		generatedBy: 'DV Choice Editor',
		generatedUtc: new Date().toISOString(),
		scope: target.scope,
		displayName,
		values: values
			.filter(value => value.pendingState !== 'Deleted')
			.sort((a, b) => a.value - b.value)
			.map(value => ({
				label: value.label,
				value: value.value
			})),
		operations: []
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

	if (!Array.isArray(candidate.values) && !Array.isArray(candidate.operations)) {
		throw new Error('Invalid DVCE definition file. Expected a values or operations array.');
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
		generatedBy: candidate.generatedBy,
		generatedUtc: candidate.generatedUtc,
		sourceEnvironment: candidate.sourceEnvironment,
		targetEnvironment: candidate.targetEnvironment,
		target,
		displayName: candidate.displayName,
		values: (candidate.values ?? []).map(toArtifactValue),
		operations: (candidate.operations ?? []).map(toArtifactOperation)
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

	return { label, value: toOptionValue(candidate.value, `Invalid value for ${label}`) };
}

function toArtifactOperation(operation: unknown, index: number): NormalizedChoiceDefinitionArtifactOperation {
	if (!operation || typeof operation !== 'object') {
		throw new Error(`Invalid operation at index ${index}. Expected an operation object.`);
	}

	const candidate = operation as ChoiceDefinitionArtifactOperation;
	const rawOperation = String(candidate.operation ?? candidate.kind ?? '').trim();
	const normalizedOperation = rawOperation.toLowerCase();

	if (['add', 'addoption', 'create', 'createoption'].includes(normalizedOperation)) {
		const label = requireLabel(candidate.label, index);
		return {
			kind: 'AddOption',
			label,
			value: candidate.value === undefined || candidate.value === null || candidate.value === ''
				? undefined
				: toOptionValue(candidate.value, `Invalid AddOption value at operation ${index}`)
		};
	}

	if (['updatelabel', 'update', 'rename', 'renamelabel'].includes(normalizedOperation)) {
		const nextLabel = requireLabel(candidate.nextLabel ?? candidate.label, index);
		if (candidate.value === undefined || candidate.value === null || candidate.value === '') {
			throw new Error(`Invalid UpdateLabel operation at index ${index}. value is required.`);
		}
		return {
			kind: 'UpdateLabel',
			value: toOptionValue(candidate.value, `Invalid UpdateLabel value at operation ${index}`),
			previousLabel: typeof candidate.previousLabel === 'string' ? candidate.previousLabel.trim() : undefined,
			nextLabel
		};
	}

	if (['delete', 'deleteoption', 'remove', 'removeoption'].includes(normalizedOperation)) {
		if (candidate.value === undefined || candidate.value === null || candidate.value === '') {
			throw new Error(`Invalid DeleteOption operation at index ${index}. value is required.`);
		}
		return {
			kind: 'DeleteOption',
			value: toOptionValue(candidate.value, `Invalid DeleteOption value at operation ${index}`),
			label: typeof candidate.label === 'string' ? candidate.label.trim() : undefined
		};
	}

	throw new Error(`Unsupported DVCE operation at index ${index}: ${rawOperation || '(blank)'}. Supported operations: AddOption, UpdateLabel, DeleteOption.`);
}

function requireLabel(value: unknown, index: number): string {
	const label = typeof value === 'string' ? value.trim() : '';
	if (!label) {
		throw new Error(`Invalid operation at index ${index}. Label is required.`);
	}
	return label;
}

function toOptionValue(value: number | string, errorPrefix: string): number {
	const numericValue = Number(value);
	if (!Number.isInteger(numericValue) || numericValue < 0) {
		throw new Error(`${errorPrefix}. Option value must be a non-negative whole number.`);
	}
	return numericValue;
}
