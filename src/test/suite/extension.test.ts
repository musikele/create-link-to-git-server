import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { action } from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Simple folder test', async () => {
    //wait 500 ms for the extension to activate
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Open file1.txt
    const fileUri = vscode.Uri.file(
      vscode.workspace.workspaceFolders![0].uri.fsPath + '/file1.txt'
    );
    // Put the cursor at the first line of the file
    const doc = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(doc);
    const firstLine = new vscode.Position(0, 0);
    editor.selection = new vscode.Selection(firstLine, firstLine);
    // open the context menu
    await vscode.commands.executeCommand('editor.action.showContextMenu');
    // print the list of commands available in the context menu
    const commands = await vscode.commands.getCommands(true);
    console.log('Available commands in context menu:', commands);
    // execute the context menu item "get link to git server"
    await vscode.commands.executeCommand(
      'extension.getLinkToGitServer.helloWorld'
    );
    // Check if the link is created
    const clipboardContent = await vscode.env.clipboard.readText();
    console.log(clipboardContent);
  });
});
