import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import MarkdownIt from "markdown-it";
import { reladrawPlugin } from "../src/markdownItPlugin";
import { renderFence } from "../src/renderFence";

const EXAMPLES_DIRECTORY = join(__dirname, "fixtures", "examples");
const exampleFileNames = readdirSync(EXAMPLES_DIRECTORY).filter((name) => name.endsWith(".reladraw"));

function readExample(fileName: string): string {
  return readFileSync(join(EXAMPLES_DIRECTORY, fileName), "utf8");
}

function allExamplesAsMarkdown(): string {
  return exampleFileNames
    .map((fileName) => `## ${fileName}\n\n\`\`\`reladraw\n${readExample(fileName)}\n\`\`\`\n`)
    .join("\n");
}

function renderPage(): string {
  return reladrawPlugin(new MarkdownIt()).render(allExamplesAsMarkdown());
}

test("the fixture set holds every reladraw 0.8.0 example", () => {
  assert.equal(exampleFileNames.length, 25);
});

test("every example renders as a diagram with no error card", () => {
  const document = new JSDOM(renderPage()).window.document;
  assert.equal(document.querySelectorAll(".reladraw-error").length, 0);
  assert.equal(document.querySelectorAll(".reladraw-diagram").length, exampleFileNames.length);
});

test("a page holding every example has no duplicate ids", () => {
  const document = new JSDOM(renderPage()).window.document;
  const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
  assert.ok(ids.length > 0);
  assert.equal(new Set(ids).size, ids.length);
});

test("every url(#…) reference resolves to an id inside the same variant", () => {
  const document = new JSDOM(renderPage()).window.document;
  let referenceCount = 0;
  for (const variant of document.querySelectorAll(".reladraw-variant")) {
    const idsInVariant = new Set([...variant.querySelectorAll("[id]")].map((element) => element.id));
    for (const match of variant.innerHTML.matchAll(/url\(#([^)]+)\)/g)) {
      referenceCount += 1;
      assert.ok(idsInVariant.has(match[1]), `unresolved reference ${match[1]}`);
    }
  }
  assert.ok(referenceCount > 0);
});

test("rendering the same page twice produces identical html", () => {
  assert.equal(renderPage(), renderPage());
});

test("the largest example renders all four variants within 50 ms", () => {
  const source = readExample("arch.reladraw");
  renderFence(source, 0);
  renderFence(source, 0);
  const samples: number[] = [];
  for (let sampleIndex = 0; sampleIndex < 5; sampleIndex += 1) {
    const startTime = performance.now();
    renderFence(source, 0);
    samples.push(performance.now() - startTime);
  }
  samples.sort((left, right) => left - right);
  const medianMilliseconds = samples[2];
  assert.ok(medianMilliseconds <= 50, `median of ${JSON.stringify(samples.map((n) => n.toFixed(2)))} ms`);
});
