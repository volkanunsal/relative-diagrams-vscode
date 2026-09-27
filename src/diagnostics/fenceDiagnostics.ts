import { compile, SourceError } from "reladraw";
import { logError } from "../logger";
import type { FenceDiagnostic } from "./types";

export interface FenceDiagnosticsDependencies {
  compile: typeof compile;
  logError: typeof logError;
}

const defaultDependencies: FenceDiagnosticsDependencies = { compile, logError };

export function collectFenceDiagnostics(
  fenceContent: string,
  dependencies: FenceDiagnosticsDependencies = defaultDependencies,
): FenceDiagnostic[] {
  if (fenceContent.trim() === "") {
    return [];
  }
  try {
    dependencies.compile(fenceContent);
    return [];
  } catch (error) {
    if (!(error instanceof SourceError)) {
      dependencies.logError("compile threw a non-SourceError", { error, fenceContent });
      return [];
    }
    const contentLines = fenceContent.split("\n");
    const line = Math.min(Math.max(0, error.line - 1), contentLines.length - 1);
    return [
      {
        line,
        startColumn: 0,
        endColumn: Math.max(1, contentLines[line].length),
        message: error.message,
      },
    ];
  }
}
