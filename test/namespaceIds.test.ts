import { test } from "node:test";
import assert from "node:assert/strict";
import { namespaceIds } from "../src/namespaceIds";

test("prefixes marker ids and the url() references that point at them", () => {
  const svg = '<marker id="arrow-5c5c7c"/><path marker-end="url(#arrow-5c5c7c)"/>';
  assert.equal(
    namespaceIds(svg, "p-"),
    '<marker id="p-arrow-5c5c7c"/><path marker-end="url(#p-arrow-5c5c7c)"/>',
  );
});

test("prefixes mask ids and mask references", () => {
  const svg = '<mask id="cut-1"></mask><path mask="url(#cut-1)"/>';
  assert.equal(namespaceIds(svg, "p-"), '<mask id="p-cut-1"></mask><path mask="url(#p-cut-1)"/>');
});

test("leaves in-page href links unchanged", () => {
  const svg = '<a href="#heading" target="_blank"><rect/></a>';
  assert.equal(namespaceIds(svg, "p-"), svg);
});

test("does not treat attributes ending in id as ids", () => {
  const svg = '<rect data-grid="x" valid="y"/>';
  assert.equal(namespaceIds(svg, "p-"), svg);
});

test("leaves text content containing url(#x) unchanged", () => {
  const svg = '<text>see url(#x) and id="y"</text><mask id="cut-1"/>';
  assert.equal(
    namespaceIds(svg, "p-"),
    '<text>see url(#x) and id="y"</text><mask id="p-cut-1"/>',
  );
});

test("leaves an href whose value looks like a url() reference unchanged", () => {
  const svg = '<a href="https://example.com/url(#frag)"><rect/></a>';
  assert.equal(namespaceIds(svg, "p-"), svg);
});
