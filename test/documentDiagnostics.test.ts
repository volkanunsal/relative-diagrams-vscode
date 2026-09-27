import { test } from "node:test";
import assert from "node:assert/strict";
import { computeDocumentDiagnostics } from "../src/diagnostics/documentDiagnostics";

const UNPLACED_LINES = ['node a "A"', 'node b "B"', "edge a -> b"];

test("a document with no reladraw fences has no diagnostics", () => {
  assert.deepEqual(computeDocumentDiagnostics("# Title\n\n```js\nnode b\n```\n"), []);
});

test("a failing fence reports the absolute document line", () => {
  const text = ["# Title", "", "```reladraw", ...UNPLACED_LINES, "```", ""].join("\n");
  const [diagnostic] = computeDocumentDiagnostics(text);
  assert.equal(diagnostic.line, 4);
  assert.equal(diagnostic.startColumn, 0);
  assert.equal(diagnostic.endColumn, 'node b "B"'.length);
});

test("each failing fence in a document gets its own diagnostic", () => {
  const fence = ["```reladraw", ...UNPLACED_LINES, "```"];
  const text = ["# Title", "", ...fence, "", "Between.", "", ...fence, ""].join("\n");
  assert.deepEqual(
    computeDocumentDiagnostics(text).map((diagnostic) => diagnostic.line),
    [4, 12],
  );
});

test("a fence nested in a list is offset by its indentation", () => {
  const text = ["- item", "", "  ```reladraw", ...UNPLACED_LINES.map((line) => `  ${line}`), "  ```", ""].join("\n");
  const [diagnostic] = computeDocumentDiagnostics(text);
  assert.equal(diagnostic.line, 4);
  assert.equal(diagnostic.startColumn, 2);
  assert.equal(diagnostic.endColumn, 2 + 'node b "B"'.length);
});

test("a fence inside a blockquote is offset by the quote marker", () => {
  const text = ["> ```reladraw", ...UNPLACED_LINES.map((line) => `> ${line}`), "> ```", ""].join("\n");
  const [diagnostic] = computeDocumentDiagnostics(text);
  assert.equal(diagnostic.line, 2);
  assert.equal(diagnostic.startColumn, 2);
});

test("CRLF line endings map to the same lines as LF", () => {
  const text = ["# Title", "", "```reladraw", ...UNPLACED_LINES, "```", ""].join("\r\n");
  const [diagnostic] = computeDocumentDiagnostics(text);
  assert.equal(diagnostic.line, 4);
  assert.equal(diagnostic.endColumn, 'node b "B"'.length);
});
