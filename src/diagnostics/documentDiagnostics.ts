import * as MarkdownItModule from "markdown-it";
import { logError } from "../logger";
import { FENCE_LANGUAGE, type MarkdownItInstance } from "../markdownItPlugin";
import { collectFenceDiagnostics } from "./fenceDiagnostics";
import type { FenceDiagnostic } from "./types";

const defaultMarkdownIt = new MarkdownItModule.default();

export function computeDocumentDiagnostics(
  text: string,
  dependencies: { markdownIt: MarkdownItInstance } = { markdownIt: defaultMarkdownIt },
): FenceDiagnostic[] {
  let tokens;
  try {
    tokens = dependencies.markdownIt.parse(text, {});
  } catch (error) {
    logError("markdown-it tokenization threw", { error });
    return [];
  }

  const rawLines = text.replace(/\r\n?/g, "\n").split("\n");
  const diagnostics: FenceDiagnostic[] = [];
  for (const token of tokens) {
    if (token.type !== "fence" || token.info.trim().toLowerCase() !== FENCE_LANGUAGE || !token.map) {
      continue;
    }
    const contentStartLine = token.map[0] + 1;
    const contentLines = token.content.split("\n");
    for (const diagnostic of collectFenceDiagnostics(token.content)) {
      const absoluteLine = contentStartLine + diagnostic.line;
      const rawLine = rawLines[absoluteLine] ?? "";
      const contentLine = contentLines[diagnostic.line] ?? "";
      const indent = Math.max(0, rawLine.length - contentLine.length);
      diagnostics.push({
        ...diagnostic,
        line: absoluteLine,
        startColumn: diagnostic.startColumn + indent,
        endColumn: diagnostic.endColumn + indent,
      });
    }
  }
  return diagnostics;
}
