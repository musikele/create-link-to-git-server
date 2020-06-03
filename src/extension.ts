// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; 

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.info('Congratulations, your extension "create-link-to-git-server" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerTextEditorCommand('create-link-to-git-server.helloWorld', (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
		// The code you place here will be executed every time your command is executed

		const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git').exports;
		const api = gitExtension.getAPI(1);
		console.log('all repositories: ', api.repositories[0].state.remotes);
		console.log('current repository: ', api.repositories[0].state.HEAD.name);
		console.log('current remote: ', api.repositories[0].state.HEAD.upstream.remote);
		console.log('current remote url: ', api.repositories[0].state.remotes.filter(remote => remote.name === api.repositories[0].state.HEAD.upstream.remote).map(remote => remote.fetchUrl)[0]);

		// Display a message box to the user
		vscode.window.showInformationMessage('line number: ' + textEditor.selection.start.line);

		//example link: 
		//https://rtkgit001.rtk.io/musikele/portal/blob/1639-not-found-http-exception/public/index.php#L21

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
