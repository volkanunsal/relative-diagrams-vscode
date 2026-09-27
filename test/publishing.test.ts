import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");

test("the icon is a 128x128 PNG with an alpha channel", () => {
  const icon = readFileSync(join(ROOT, "media", "icon.png"));
  assert.equal(icon.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(icon.readUInt32BE(16), 128);
  assert.equal(icon.readUInt32BE(20), 128);
  assert.equal(icon[25], 6);
});

const RAW_GITHUB_PREFIX = /^https:\/\/raw\.githubusercontent\.com\/volkanunsal\/relative-diagrams-vscode\//;
const REPO_OWNED_PATH = /(^|\/)(media|docs\/images)\//;

test("README images are absolute, and this repo's own images use the raw.githubusercontent prefix", () => {
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  const imageSources = [
    ...[...readme.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((match) => match[1]),
    ...[...readme.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((match) => match[1]),
  ];
  assert.ok(imageSources.length > 0, "README has no images");
  for (const source of imageSources) {
    assert.match(source, /^https:\/\//, `not absolute: ${source}`);
    if (REPO_OWNED_PATH.test(source)) {
      assert.match(source, RAW_GITHUB_PREFIX, `repo-owned image not on raw.githubusercontent: ${source}`);
    }
  }
});
