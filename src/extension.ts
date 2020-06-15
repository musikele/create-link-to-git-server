import * as vscode from 'vscode'; 

interface Remote {
	name: string, 
	fetchUrl: string
}

export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerTextEditorCommand('create-link-to-git-server.helloWorld', (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {

		const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
		const api = gitExtension.getAPI(1);
		const branch = api.repositories[0].state.HEAD.name;
		const currentRemote = api.repositories[0].state.HEAD?.upstream?.remote;  
		if (!currentRemote) {
			vscode.window.showInformationMessage('No remote is configured for this branch. please set a remote with git push --set-upstream');
			return;
		}

		const fetchUrl = api.repositories[0].state.remotes
			.filter((remote: Remote) => remote.name === currentRemote)
			.map((remote: Remote) => remote.fetchUrl)
			[0];

		const remoteUrl = getRemoteUrl(fetchUrl);
		const projectGroup = getProjectGroup(fetchUrl);
		const projectName = getProjectName(fetchUrl);
		const filename = textEditor.document.fileName
			.replace(vscode.workspace.rootPath || '', '')
			.replace('\\', '/');
		const shareableLink = `${remoteUrl}/${projectGroup}/${projectName}/blob/${branch}${filename}#L${textEditor.selection.start.line+1}`;

		vscode.env.clipboard.writeText(shareableLink);
		vscode.window.showInformationMessage('Link copied in clipboard.');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function getRemoteUrl(fetchUrl: string): string {
	console.log(fetchUrl.startsWith('git'));
	if (fetchUrl.startsWith('git')) {
		return 'https://' + fetchUrl.slice(fetchUrl.indexOf('@')+1, fetchUrl.indexOf(':'));
	} else if (fetchUrl.startsWith('https')) {
		const afterHttps = fetchUrl.split('//')[1];
		const remoteHost = afterHttps.split('/')[0];
		return 'https://' + remoteHost; 
	} 
	return '';
}

function getProjectGroup(fetchUrl:string): string {
	if (fetchUrl.startsWith('git')) {
		return fetchUrl.slice(fetchUrl.indexOf(':')+1, fetchUrl.indexOf('/'));
	}
	else if (fetchUrl.startsWith('https')) {
		const afterHttps = fetchUrl.split('//')[1];
		const projectGroup = afterHttps.split('/')[1];
		return projectGroup;
	}
	return '';
}

function getProjectName(fetchUrl:string):string { 
	if (fetchUrl.startsWith('git')) {
		return fetchUrl.slice(fetchUrl.indexOf('/')+1, -4);
	} else if (fetchUrl.startsWith('https')) {
		const afterHttps = fetchUrl.split('//')[1];
		const projectName = afterHttps.split('/')[2].slice(0, -4);
		return projectName;	
	}
	return '';
}