import * as vscode from 'vscode';

interface Repository {
  state: {
    remotes: Remote[];
    HEAD: {
      name: string;
      upstream?: {
        remote: string;
      };
    };
  };
}
interface Remote {
  name: string;
  fetchUrl: string;
}

function getWorkspaceFolderOfActiveFile(): vscode.WorkspaceFolder | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('No active file.');
    return;
  }

  const documentUri = editor.document.uri;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);

  return workspaceFolder;
}

function getRepositoryForActiveFile(api: any): any | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return undefined;
  const filePath = editor.document.uri.fsPath;

  return api.repositories.find((repo: any) =>
    filePath.startsWith(repo.rootUri.fsPath)
  );
}

export const action = (
  textEditor: vscode.TextEditor,
  edit: vscode.TextEditorEdit
) => {
  const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
  const api = gitExtension.getAPI(1);
  const activeWorkspace = getWorkspaceFolderOfActiveFile();
  /**
   * a window is a worskspace if it has more than one repository
   */
  const isWorkspace = api.repositories.length > 1;

  if (!activeWorkspace) {
    const activeWorkspaceError =
      'No workspace folder found for the active file.';
    vscode.window.showInformationMessage(activeWorkspaceError);
    throw new Error(activeWorkspaceError);
  }

  const remotes: Remote[] = api.repositories.flatMap(
    (repo: Repository) => repo.state.remotes
  );

  const repository: Repository = getRepositoryForActiveFile(api);

  const currentRemote = repository?.state.HEAD?.upstream?.remote;
  if (!currentRemote) {
    vscode.window.showInformationMessage(
      'No remote is configured for this branch. please set a remote with git push --set-upstream'
    );
    return;
  }

  let selectedRemote = remotes.filter(
    (remote) => remote.name === currentRemote
  );

  if (selectedRemote.length > 1) {
    selectedRemote = remotes.filter(
      (remote) =>
        remote.name === currentRemote &&
        remote.fetchUrl.indexOf(`${activeWorkspace.name}.git`) > -1
    );
  }

  const branch = repository?.state.HEAD?.name;
  if (!branch) {
    vscode.window.showInformationMessage(
      'No branch is currently checked out. Please checkout a branch first.'
    );
    return;
  }

  const fetchUrl = selectedRemote[0]?.fetchUrl;

  const remoteUrl = getRemoteUrl(fetchUrl);
  const projectGroup = getProjectGroup(fetchUrl);
  const projectName = getProjectName(fetchUrl);
  let filename = vscode.workspace.asRelativePath(textEditor.document.uri);
  filename = isWorkspace
    ? filename.replace(`${activeWorkspace.name}/`, '')
    : filename;
  const shareableLink = `${remoteUrl}/${projectGroup}/${projectName}/blob/${branch}/${filename}#L${
    textEditor.selection.start.line + 1
  }`;

  vscode.env.clipboard.writeText(shareableLink);
  vscode.window.showInformationMessage('Link copied in clipboard.');
};

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand(
    'create-link-to-git-server.helloWorld',
    action
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

export function getRemoteUrl(fetchUrl: string): string {
  console.log(fetchUrl.startsWith('git'));
  if (fetchUrl.startsWith('git')) {
    return (
      'https://' +
      fetchUrl.slice(fetchUrl.indexOf('@') + 1, fetchUrl.indexOf(':'))
    );
  } else if (fetchUrl.startsWith('https')) {
    const afterHttps = fetchUrl.split('//')[1];
    const remoteHost = afterHttps.split('/')[0];
    return 'https://' + remoteHost;
  }
  return '';
}

export function getProjectGroup(fetchUrl: string): string {
  if (fetchUrl.startsWith('git')) {
    return fetchUrl.slice(fetchUrl.indexOf(':') + 1, fetchUrl.indexOf('/'));
  } else if (fetchUrl.startsWith('https')) {
    const afterHttps = fetchUrl.split('//')[1];
    const projectGroup = afterHttps.split('/')[1];
    return projectGroup;
  }
  return '';
}

export function getProjectName(fetchUrl: string): string {
  if (fetchUrl.startsWith('git')) {
    return fetchUrl.slice(fetchUrl.indexOf('/') + 1, -4);
  } else if (fetchUrl.startsWith('https')) {
    const afterHttps = fetchUrl.split('//')[1];
    const projectName = afterHttps.split('/')[2].slice(0, -4);
    return projectName;
  }
  return '';
}
