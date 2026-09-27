import { test } from "node:test";
import assert from "node:assert/strict";
import MarkdownIt from "markdown-it";
import { reladrawPlugin } from "../src/markdownItPlugin";

const TWO_NODES = 'node a "A"\nnode b "B"  right of a\nedge a -> b';

function renderWithPlugin(markdown: string): string {
  return reladrawPlugin(new MarkdownIt()).render(markdown);
}

test("replaces a reladraw fence with a rendered diagram", () => {
  const html = renderWithPlugin("```reladraw\n" + TWO_NODES + "\n```\n");
  assert.match(html, /^<div class="reladraw-diagram code-line" data-line="0" dir="auto"><div class="reladraw-variant" data-variant="dark"><svg /);
  assert.doesNotMatch(html, /<pre>/);
});

test("renders a tilde reladraw fence the same way", () => {
  assert.match(renderWithPlugin("~~~reladraw\n" + TWO_NODES + "\n~~~\n"), /class="reladraw-diagram code-line"/);
});

test("marks the wrapper with the fence's starting line, for scroll sync and double-click-to-source", () => {
  const html = renderWithPlugin("# Title\n\n```reladraw\n" + TWO_NODES + "\n```\n");
  assert.match(html, /class="reladraw-diagram code-line" data-line="2" dir="auto"/);
});

test("marks an error card's wrapper the same way", () => {
  const html = renderWithPlugin('```reladraw\nnode a "A"\nnode b "B"\nedge a -> b\n```\n');
  assert.match(html, /class="reladraw-error code-line" data-line="0" dir="auto"/);
});

test("renders a fence whose info string is uppercase, matching the injection grammar's case-insensitivity", () => {
  assert.match(renderWithPlugin("```RELADRAW\n" + TWO_NODES + "\n```\n"), /class="reladraw-diagram/);
});

test("leaves other fences to the default renderer", () => {
  const markdown = "```js\nconsole.log(1);\n```\n";
  assert.equal(renderWithPlugin(markdown), new MarkdownIt().render(markdown));
});

test("leaves a fence whose info string only starts with reladraw to the default renderer", () => {
  const markdown = "```reladraw-old\n" + TWO_NODES + "\n```\n";
  assert.equal(renderWithPlugin(markdown), new MarkdownIt().render(markdown));
});
