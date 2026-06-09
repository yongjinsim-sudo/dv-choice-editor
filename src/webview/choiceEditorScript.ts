export const choiceEditorScript = `
(function () {
	const vscode = acquireVsCodeApi();

	function post(command, payload) {
		vscode.postMessage({ command, payload: payload || {} });
	}

	document.querySelectorAll('[data-command]').forEach((button) => {
		button.addEventListener('click', () => {
			const payload = {};
			if (button instanceof HTMLElement) {
				Object.keys(button.dataset).forEach((key) => {
					payload[key] = button.dataset[key];
				});
			}

			post(button.getAttribute('data-command'), payload);
		});
	});

	const entitySelect = document.getElementById('entity');
	if (entitySelect) {
		entitySelect.addEventListener('change', () => {
			post('selectEntity', { logicalName: entitySelect.value });
		});
	}

	const choiceSelect = document.getElementById('choice');
	if (choiceSelect) {
		choiceSelect.addEventListener('change', () => {
			post('selectChoice', { logicalName: choiceSelect.value });
		});
	}
})();
`;
