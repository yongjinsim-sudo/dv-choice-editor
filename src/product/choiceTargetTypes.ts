export type ChoiceScope = 'local' | 'global';

export type LocalChoiceTarget = {
	scope: 'local';
	entityLogicalName: string;
	attributeLogicalName: string;
};

export type GlobalChoiceTarget = {
	scope: 'global';
	optionSetName: string;
};

export type ChoiceTarget = LocalChoiceTarget | GlobalChoiceTarget;

export function getChoiceTargetKey(target: ChoiceTarget | undefined): string | undefined {
	if (!target) {
		return undefined;
	}

	return target.scope === 'local'
		? `local:${target.entityLogicalName}:${target.attributeLogicalName}`
		: `global:${target.optionSetName}`;
}

export function getChoiceTargetLabel(target: ChoiceTarget | undefined): string {
	if (!target) {
		return 'None';
	}

	return target.scope === 'local'
		? `${target.entityLogicalName}.${target.attributeLogicalName}`
		: target.optionSetName;
}

export function isSameChoiceTarget(left: ChoiceTarget | undefined, right: ChoiceTarget | undefined): boolean {
	return getChoiceTargetKey(left) === getChoiceTargetKey(right);
}
