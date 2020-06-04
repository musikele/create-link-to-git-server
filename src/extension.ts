// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; 
import { RemoteInfo } from 'dgram';

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

		const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
		const api = gitExtension.getAPI(1);
		console.log('all repositories: ', api.repositories[0].state.remotes);
		const branch = api.repositories[0].state.HEAD.name;
		console.log('current repository: ', api.repositories[0].state.HEAD.name);
		const currentRemote = api.repositories[0].state.HEAD?.upstream?.remote || 'origin';  
		if (currentRemote) {
			vscode.env.clipboard.writeText('No remote is configured for this branch. setting default as origin');
		}

		interface Remote {
			name: string, 
			fetchUrl: string
		}

		const fetchUrl = api.repositories[0].state.remotes
			.filter((remote: Remote) => remote.name === currentRemote)
			.map((remote: Remote) => remote.fetchUrl)
			[0];
		console.log('current remote url: ', fetchUrl);

		const remoteUrl = getRemoteUrl(fetchUrl);
		console.log('remote url: ', remoteUrl);
		const projectGroup = getProjectGroup(fetchUrl); 
		const projectName = getProjectName(fetchUrl);
		const filename = textEditor.document.fileName.replace(vscode.workspace.rootPath || '', '');
		const shareableLink = `${remoteUrl}/${projectGroup}/${projectName}/blob/${branch}${filename}#L${textEditor.selection.start.line+1}`;

		vscode.env.clipboard.writeText(shareableLink);

		// Display a message box to the user
		vscode.window.showInformationMessage(shareableLink);

		// example link: 
		// https://rtkgit001.rtk.io/thor/portal/blob/master/public/index.php#L10
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getRemoteUrl(fetchUrl: string): string {
	return 'https://' + fetchUrl.slice(fetchUrl.indexOf('@')+1, fetchUrl.indexOf(':'));
}

function getProjectGroup(fetchUrl:string): string {
	return fetchUrl.slice(fetchUrl.indexOf(':')+1, fetchUrl.indexOf('/'));
}

function getProjectName(fetchUrl:string):string {
	return fetchUrl.slice(fetchUrl.indexOf('/')+1, -4);
}