import * as vscode from 'vscode';
import { openChoiceEditorCommand } from './commands/openChoiceEditorCommand';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('dvChoiceEditor.openChoiceEditor', () => openChoiceEditorCommand(context))
	);
}

export function deactivate() {}
