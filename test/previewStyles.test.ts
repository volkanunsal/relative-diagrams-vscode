import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";

const STYLESHEET = readFileSync(join(__dirname, "..", "media", "previewStyles.css"), "utf8");
const FOUR_VARIANTS = ["dark", "light", "high-contrast-dark", "high-contrast-light"];

function visibleVariants(bodyClass: string, variantNames: string[] = FOUR_VARIANTS): string[] {
  const variantHtml = variantNames
    .map((name) => `<div class="reladraw-variant" data-variant="${name}"><svg width="900" height="100"></svg></div>`)
    .join("");
  const dom = new JSDOM(
    `<html><head><style>${STYLESHEET}</style></head><body class="${bodyClass}"><div class="reladraw-diagram">${variantHtml}</div></body></html>`,
  );
  const { document, getComputedStyle } = dom.window;
  return [...document.querySelectorAll(".reladraw-variant")]
    .filter((element) => getComputedStyle(element).display !== "none")
    .map((element) => element.getAttribute("data-variant") ?? "");
}

test("a light editor shows only the light variant", () => {
  assert.deepEqual(visibleVariants("vscode-body vscode-light"), ["light"]);
});

test("a dark editor shows only the dark variant", () => {
  assert.deepEqual(visibleVariants("vscode-body vscode-dark"), ["dark"]);
});

test("a high contrast dark editor shows only the high-contrast-dark variant", () => {
  assert.deepEqual(visibleVariants("vscode-body vscode-high-contrast"), ["high-contrast-dark"]);
});

test("a high contrast dark editor that also carries vscode-dark still shows one variant", () => {
  assert.deepEqual(visibleVariants("vscode-body vscode-dark vscode-high-contrast"), ["high-contrast-dark"]);
});

test("a high contrast light editor shows only the high-contrast-light variant", () => {
  assert.deepEqual(
    visibleVariants("vscode-body vscode-high-contrast vscode-high-contrast-light"),
    ["high-contrast-light"],
  );
});

test("a high contrast light editor that also carries vscode-light still shows one variant", () => {
  assert.deepEqual(
    visibleVariants("vscode-body vscode-light vscode-high-contrast vscode-high-contrast-light"),
    ["high-contrast-light"],
  );
});

test("a body with no theme class shows only the dark variant", () => {
  assert.deepEqual(visibleVariants(""), ["dark"]);
});

test("a fence with its own theme is shown under every editor theme", () => {
  for (const bodyClass of ["vscode-light", "vscode-dark", "vscode-high-contrast", ""]) {
    assert.deepEqual(visibleVariants(bodyClass, ["file"]), ["file"]);
  }
});

test("diagram svgs shrink to the preview width", () => {
  const dom = new JSDOM(
    `<html><head><style>${STYLESHEET}</style></head><body class="vscode-dark"><div class="reladraw-variant" data-variant="dark"><svg></svg></div></body></html>`,
  );
  const style = dom.window.getComputedStyle(dom.window.document.querySelector("svg")!);
  assert.equal(style.maxWidth, "100%");
  assert.equal(style.height, "auto");
});
