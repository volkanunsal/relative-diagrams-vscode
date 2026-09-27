import * as vscode from "vscode";
import { computeDocumentDiagnostics } from "./diagnostics/documentDiagnostics";
import { reladrawPlugin, type MarkdownItInstance } from "./markdownItPlugin";

const DEBOUNCE_MILLISECONDS = 300;

function urisOfTab(tab: vscode.Tab): vscode.Uri[] {
  const input = tab.input;
  if (input instanceof vscode.TabInputText) {
    return [input.uri];
  }
  if (input instanceof vscode.TabInputTextDiff) {
    return [input.original, input.modified];
  }
  return [];
}

function isDiagnosableDocument(document: vscode.TextDocument): boolean {
  return (
    document.languageId === "markdown" &&
    (document.uri.scheme === "file" || document.uri.scheme === "untitled")
  );
}

export function activate(context: vscode.ExtensionContext) {
  const collection = vscode.languages.createDiagnosticCollection("reladraw");
  context.subscriptions.push(collection);

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  context.subscriptions.push({
    dispose: () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    },
  });

  function refresh(document: vscode.TextDocument): void {
    if (!isDiagnosableDocument(document)) {
      return;
    }
    const diagnostics = computeDocumentDiagnostics(document.getText()).map((fenceDiagnostic) => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
          fenceDiagnostic.line,
          fenceDiagnostic.startColumn,
          fenceDiagnostic.line,
          fenceDiagnostic.endColumn,
        ),
        fenceDiagnostic.message,
        vscode.DiagnosticSeverity.Error,
      );
      diagnostic.source = "reladraw";
      return diagnostic;
    });
    collection.set(document.uri, diagnostics);
  }

  function scheduleRefresh(document: vscode.TextDocument): void {
    if (!isDiagnosableDocument(document)) {
      return;
    }
    const key = document.uri.toString();
    const existingTimer = timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        refresh(document);
      }, DEBOUNCE_MILLISECONDS),
    );
  }

  function clearForUri(uri: vscode.Uri): void {
    const key = uri.toString();
    const existingTimer = timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timers.delete(key);
    }
    collection.delete(uri);
  }

  function isUriStillVisible(uri: vscode.Uri): boolean {
    const key = uri.toString();
    return vscode.window.tabGroups.all.some((group) =>
      group.tabs.some((tab) => urisOfTab(tab).some((tabUri) => tabUri.toString() === key)),
    );
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(refresh),
    vscode.workspace.onDidChangeTextDocument((event) => scheduleRefresh(event.document)),
    vscode.workspace.onDidCloseTextDocument((document) => clearForUri(document.uri)),
    vscode.window.tabGroups.onDidChangeTabs((event) => {
      for (const tab of event.opened) {
        for (const uri of urisOfTab(tab)) {
          const key = uri.toString();
          const document = vscode.workspace.textDocuments.find(
            (openDocument) => openDocument.uri.toString() === key,
          );
          if (document) {
            refresh(document);
          }
        }
      }
      for (const tab of event.closed) {
        for (const uri of urisOfTab(tab)) {
          if (!isUriStillVisible(uri)) {
            clearForUri(uri);
          }
        }
      }
    }),
  );

  for (const document of vscode.workspace.textDocuments) {
    refresh(document);
  }

  return {
    extendMarkdownIt(markdownItInstance: MarkdownItInstance): MarkdownItInstance {
      return reladrawPlugin(markdownItInstance);
    },
  };
}

export function deactivate(): void {}
