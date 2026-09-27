import * as vscode from "vscode";
import { reladrawPlugin, type MarkdownItInstance } from "./markdownItPlugin";

export function activate(_context: vscode.ExtensionContext) {
  return {
    extendMarkdownIt(markdownItInstance: MarkdownItInstance): MarkdownItInstance {
      return reladrawPlugin(markdownItInstance);
    },
  };
}

export function deactivate(): void {}
