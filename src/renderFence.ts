import { compile, parse, SourceError, THEMES } from "reladraw";
import type { Document } from "reladraw";
import { escapeHtml } from "./escapeHtml";
import { logError } from "./logger";
import { namespaceIds } from "./namespaceIds";

export const THEME_VARIANTS = ["dark", "light", "high-contrast-dark", "high-contrast-light"] as const;
export const FILE_VARIANT = "file";
const UNSTYLED_VISIBLE_VARIANTS = new Set<string>(["dark", FILE_VARIANT]);

type CompileOptions = NonNullable<Parameters<typeof compile>[1]>;

interface Variant {
  name: string;
  options: CompileOptions;
}

export interface RenderFenceDependencies {
  compile: typeof compile;
  logError: typeof logError;
}

const defaultDependencies: RenderFenceDependencies = { compile, logError };

function declaresTheme(document: Document): boolean {
  return document.statements.some(
    (statement) => statement.kind === "diagram" && "theme" in statement.attrs,
  );
}

function variantsFor(source: string): Variant[] {
  if (declaresTheme(parse(source))) {
    return [{ name: FILE_VARIANT, options: {} }];
  }
  return THEME_VARIANTS.map((name) => ({ name, options: { theme: THEMES[name] } }));
}

function fnv1aHex(text: string): string {
  let hash = 0x811c9dc5;
  for (const character of text) {
    hash ^= character.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function errorCard(
  message: string,
  source: string,
  wrapperClass: string,
  wrapperAttrs: string,
  failingLine?: number,
): string {
  const sourceLines = source
    .replace(/\n$/, "")
    .split("\n")
    .map((lineText, lineIndex) => {
      const escapedLine = escapeHtml(lineText);
      return lineIndex + 1 === failingLine
        ? `<mark class="reladraw-error-line">${escapedLine}</mark>`
        : escapedLine;
    })
    .join("\n");
  return `<div class="reladraw-error${wrapperClass}"${wrapperAttrs}><div class="reladraw-error-message">${escapeHtml(message)}</div><pre class="reladraw-error-source">${sourceLines}</pre></div>\n`;
}

export function renderFence(
  source: string,
  fenceIndex: number,
  dependencies: RenderFenceDependencies = defaultDependencies,
  sourceLine?: number,
): string {
  if (source.trim() === "") {
    return "";
  }
  const wrapperClass = sourceLine === undefined ? "" : " code-line";
  const wrapperAttrs = sourceLine === undefined ? "" : ` data-line="${sourceLine}" dir="auto"`;
  try {
    const sourceHash = fnv1aHex(source);
    const variantHtml = variantsFor(source)
      .map((variant) => {
        const svg = dependencies.compile(source, variant.options);
        const prefix = `rd-${sourceHash}-${fenceIndex}-${variant.name}-`;
        const hiddenAttr = UNSTYLED_VISIBLE_VARIANTS.has(variant.name) ? "" : " hidden";
        return `<div class="reladraw-variant" data-variant="${variant.name}"${hiddenAttr}>${namespaceIds(svg, prefix)}</div>`;
      })
      .join("");
    return `<div class="reladraw-diagram${wrapperClass}"${wrapperAttrs}>${variantHtml}</div>\n`;
  } catch (error) {
    if (error instanceof SourceError) {
      return errorCard(error.format(), source, wrapperClass, wrapperAttrs, error.line);
    }
    const message = error instanceof Error ? error.message : String(error);
    dependencies.logError("render threw a non-SourceError", { error, source });
    return errorCard(`reladraw internal error: ${message}`, source, wrapperClass, wrapperAttrs);
  }
}
