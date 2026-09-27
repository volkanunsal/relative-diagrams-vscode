import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { compile } from "reladraw";
import { renderFence, type RenderFenceDependencies } from "../src/renderFence";

const TWO_NODES = 'node a "A"\nnode b "B"  right of a\nedge a -> b\n';
const THEMED = 'diagram theme: nord\nnode a "A"\nnode b "B"  right of a\nedge a -> b\n';
const UNPLACED = 'node a "A"\nnode b "B"\nedge a -> b\n';

function parseHtml(html: string): Document {
  return new JSDOM(`<body>${html}</body>`).window.document;
}

function variantNames(html: string): string[] {
  return [...parseHtml(html).querySelectorAll(".reladraw-variant")].map(
    (element) => element.getAttribute("data-variant") ?? "",
  );
}

test("renders four theme variants when the fence names no theme", () => {
  assert.deepEqual(variantNames(renderFence(TWO_NODES, 0)), [
    "dark",
    "light",
    "high-contrast-dark",
    "high-contrast-light",
  ]);
});

test("the four variants use different theme colors", () => {
  const document = parseHtml(renderFence(TWO_NODES, 0));
  const variantMarkup = [...document.querySelectorAll(".reladraw-variant")].map((element) =>
    element.innerHTML.replace(
      new RegExp(`rd-[0-9a-f]{8}-0-${element.getAttribute("data-variant")}-`, "g"),
      "",
    ),
  );
  assert.equal(new Set(variantMarkup).size, 4);
});

test("renders one file variant when the fence names its own theme", () => {
  assert.deepEqual(variantNames(renderFence(THEMED, 0)), ["file"]);
});

test("the file variant is rendered with no theme override", () => {
  const html = renderFence(THEMED, 0);
  const svgWithoutPrefixes = parseHtml(html)
    .querySelector(".reladraw-variant svg")!
    .outerHTML.replace(/rd-[0-9a-f]{8}-0-file-/g, "");
  const expected = parseHtml(compile(THEMED)).querySelector("svg")!.outerHTML;
  assert.equal(svgWithoutPrefixes, expected);
});

test("every id in a variant carries that fence's and variant's prefix", () => {
  const document = parseHtml(renderFence(TWO_NODES, 3));
  for (const variant of document.querySelectorAll(".reladraw-variant")) {
    const variantName = variant.getAttribute("data-variant");
    for (const element of variant.querySelectorAll("[id]")) {
      assert.match(element.id, new RegExp(`^rd-[0-9a-f]{8}-3-${variantName}-`));
    }
  }
});

test("the same source and position render identical html", () => {
  assert.equal(renderFence(TWO_NODES, 1), renderFence(TWO_NODES, 1));
});

test("the same source at two positions gets different id prefixes", () => {
  const first = parseHtml(renderFence(TWO_NODES, 1)).querySelector("[id]")!.id;
  const second = parseHtml(renderFence(TWO_NODES, 2)).querySelector("[id]")!.id;
  assert.notEqual(first, second);
});

test("a source error renders an error card with the formatted message", () => {
  const document = parseHtml(renderFence(UNPLACED, 0));
  assert.equal(document.querySelector(".reladraw-diagram"), null);
  assert.match(
    document.querySelector(".reladraw-error-message")!.textContent!,
    /^line 2: exactly one node may say nothing about where it goes/,
  );
});

test("a source error marks the failing line in the echoed source", () => {
  const document = parseHtml(renderFence(UNPLACED, 0));
  assert.equal(document.querySelector(".reladraw-error-line")!.textContent, 'node b "B"');
});

test("an unexpected exception renders an internal error card and logs it", () => {
  const loggedLabels: string[] = [];
  const dependencies: RenderFenceDependencies = {
    compile: () => {
      throw new TypeError("boom");
    },
    logError: (label) => {
      loggedLabels.push(label);
    },
  };
  const document = parseHtml(renderFence(TWO_NODES, 0, dependencies));
  assert.equal(
    document.querySelector(".reladraw-error-message")!.textContent,
    "reladraw internal error: boom",
  );
  assert.equal(document.querySelector(".reladraw-error-line"), null);
  assert.deepEqual(loggedLabels, ["render threw a non-SourceError"]);
});

test("a whitespace-only fence renders nothing", () => {
  assert.equal(renderFence("  \n\t\n", 0), "");
});

test("fence source is escaped in the error card", () => {
  const html = renderFence('node a "<script>alert(1)</script>"\nnode b "B"\n', 0);
  assert.equal(parseHtml(html).querySelector("script"), null);
  assert.match(html, /&lt;script&gt;/);
});

test("an internal error message is escaped", () => {
  const dependencies: RenderFenceDependencies = {
    compile: () => {
      throw new Error("<img src=x>");
    },
    logError: () => {},
  };
  const html = renderFence(TWO_NODES, 0, dependencies);
  assert.equal(parseHtml(html).querySelector("img"), null);
});

test("marks the diagram wrapper with data-line, code-line, and dir when a source line is given", () => {
  const html = renderFence(TWO_NODES, 0, undefined, 4);
  const wrapper = parseHtml(html).querySelector(".reladraw-diagram")!;
  assert.equal(wrapper.getAttribute("data-line"), "4");
  assert.equal(wrapper.classList.contains("code-line"), true);
  assert.equal(wrapper.getAttribute("dir"), "auto");
});

test("marks the error card the same way when a source line is given", () => {
  const html = renderFence(UNPLACED, 0, undefined, 4);
  const wrapper = parseHtml(html).querySelector(".reladraw-error")!;
  assert.equal(wrapper.getAttribute("data-line"), "4");
  assert.equal(wrapper.classList.contains("code-line"), true);
  assert.equal(wrapper.getAttribute("dir"), "auto");
});

test("omits data-line, code-line, and dir when no source line is given", () => {
  const wrapper = parseHtml(renderFence(TWO_NODES, 0)).querySelector(".reladraw-diagram")!;
  assert.equal(wrapper.hasAttribute("data-line"), false);
  assert.equal(wrapper.classList.contains("code-line"), false);
  assert.equal(wrapper.hasAttribute("dir"), false);
});
