import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { highlightLine, type TokenKind } from "reladraw";
import { buildGrammar, SCOPE_FOR_KIND, type Grammar } from "../src/grammar/buildGrammar";

const EXAMPLES_DIRECTORY = join(__dirname, "fixtures", "examples");
const CHECKED_KINDS = ["comment", "string", "keyword", "arrow", "color", "attribute", "relation"] as const;

const exampleLines = readdirSync(EXAMPLES_DIRECTORY)
  .filter((name) => name.endsWith(".reladraw"))
  .flatMap((name) => readFileSync(join(EXAMPLES_DIRECTORY, name), "utf8").split("\n"));

function rangesMatchedFor(grammar: Grammar, kind: TokenKind, line: string): Array<[number, number]> {
  const scope = SCOPE_FOR_KIND[kind as keyof typeof SCOPE_FOR_KIND];
  const ranges: Array<[number, number]> = [];
  for (const rule of grammar.patterns) {
    const captureGroup = Object.entries(rule.captures ?? {}).find(([, capture]) => capture.name === scope)?.[0];
    if (rule.name !== scope && captureGroup === undefined) {
      continue;
    }
    for (const match of line.matchAll(new RegExp(rule.match, "gd"))) {
      const range = captureGroup === undefined ? match.indices![0] : match.indices![Number(captureGroup)];
      if (range) {
        ranges.push(range);
      }
    }
  }
  return ranges;
}

test("every token the reladraw highlighter classifies is matched by the same scope in the grammar", () => {
  const grammar = buildGrammar();
  let checkedSpans = 0;
  for (const line of exampleLines) {
    for (const span of highlightLine(line)) {
      if (!(CHECKED_KINDS as readonly string[]).includes(span.kind)) {
        continue;
      }
      checkedSpans += 1;
      const covered = rangesMatchedFor(grammar, span.kind, line).some(
        ([start, end]) => start <= span.start && span.end <= end,
      );
      assert.ok(covered, `${span.kind} "${line.slice(span.start, span.end)}" in: ${line}`);
    }
  }
  assert.ok(checkedSpans > 500, `only ${checkedSpans} spans checked`);
});

test("the committed grammar file matches the generator output", () => {
  const committed = readFileSync(join(__dirname, "..", "syntaxes", "reladraw.tmLanguage.json"), "utf8");
  assert.equal(committed, `${JSON.stringify(buildGrammar(), null, 2)}\n`);
});
