import { test } from "node:test";
import assert from "node:assert/strict";
import { collectFenceDiagnostics } from "../src/diagnostics/fenceDiagnostics";

const VALID = 'node a "A"\nnode b "B"  right of a\nedge a -> b\n';
const UNPLACED = 'node a "A"\nnode b "B"\nedge a -> b\n';

test("a valid fence has no diagnostics", () => {
  assert.deepEqual(collectFenceDiagnostics(VALID), []);
});

test("a whitespace-only fence has no diagnostics", () => {
  assert.deepEqual(collectFenceDiagnostics("\n  \n"), []);
});

test("a source error becomes one diagnostic spanning the failing fence line", () => {
  assert.deepEqual(collectFenceDiagnostics(UNPLACED), [
    {
      line: 1,
      startColumn: 0,
      endColumn: 'node b "B"'.length,
      message: 'exactly one node may say nothing about where it goes, but 2 do: "a", "b"',
    },
  ]);
});

test("a parse error on the first line is reported on line 0", () => {
  const [diagnostic] = collectFenceDiagnostics("nod a\n");
  assert.equal(diagnostic.line, 0);
  assert.equal(diagnostic.endColumn, "nod a".length);
});

test("an unexpected exception is logged and produces no diagnostic", () => {
  const loggedLabels: string[] = [];
  const diagnostics = collectFenceDiagnostics(VALID, {
    compile: () => {
      throw new TypeError("boom");
    },
    logError: (label: string) => {
      loggedLabels.push(label);
    },
  });
  assert.deepEqual(diagnostics, []);
  assert.deepEqual(loggedLabels, ["compile threw a non-SourceError"]);
});
