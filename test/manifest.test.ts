import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

test("pins reladraw to exactly 0.8.0", () => {
  assert.equal(manifest.dependencies.reladraw, "0.8.0");
});

test("is licensed Apache-2.0", () => {
  assert.equal(manifest.license, "Apache-2.0");
  assert.match(readFileSync(join(ROOT, "LICENSE"), "utf8"), /Apache License\s+Version 2\.0/);
});

test("targets VS Code 1.85 and later", () => {
  assert.equal(manifest.engines.vscode, "^1.85.0");
});

test("publishes as VolkanUnsal.relative-diagrams", () => {
  assert.equal(manifest.name, "relative-diagrams");
  assert.equal(manifest.displayName, "Relative Diagrams");
  assert.equal(manifest.publisher, "VolkanUnsal");
});

test("contributes a markdown-it plugin", () => {
  assert.equal(manifest.contributes["markdown.markdownItPlugins"], true);
});

test("ships the bundled library's notice", () => {
  assert.ok(existsSync(join(ROOT, "NOTICE")));
  assert.match(readFileSync(join(ROOT, "NOTICE"), "utf8"), /reladraw 0\.8\.0/);
});

test("contributes the preview stylesheet", () => {
  assert.deepEqual(manifest.contributes["markdown.previewStyles"], ["./media/previewStyles.css"]);
});

test("contributes the preview script", () => {
  assert.deepEqual(manifest.contributes["markdown.previewScripts"], ["./media/previewScript.js"]);
});

test("every contributed grammar file exists", () => {
  for (const grammar of manifest.contributes.grammars) {
    assert.ok(existsSync(join(ROOT, grammar.path)), grammar.path);
  }
});

test("the markdown injection grammar embeds the reladraw language", () => {
  const injection = manifest.contributes.grammars.find(
    (grammar: { scopeName: string }) => grammar.scopeName === "markdown.reladraw.codeblock",
  );
  assert.deepEqual(injection.injectTo, ["text.html.markdown"]);
  assert.equal(injection.embeddedLanguages["meta.embedded.block.reladraw"], "reladraw");
});
