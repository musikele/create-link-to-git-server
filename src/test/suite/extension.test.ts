import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { action } from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Simple workspace test', () => {
    // const mockTextEditor = {} as vscode.TextEditor;
    // const mockTextEditorEdit = {} as vscode.TextEditorEdit;
    // action(mockTextEditor, mockTextEditorEdit);
  });
});
