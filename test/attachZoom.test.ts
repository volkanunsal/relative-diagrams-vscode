import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { attachZoomToVariants } from "../src/attachZoom";

function diagramDocument(): Document {
  return new JSDOM(
    '<body><div class="reladraw-diagram">' +
      '<div class="reladraw-variant" data-variant="dark"><svg></svg></div>' +
      '<div class="reladraw-variant" data-variant="light"><svg></svg></div>' +
      "</div></body>",
  ).window.document;
}

test("every variant gets its own zoom controls", () => {
  const document = diagramDocument();
  attachZoomToVariants(document);
  for (const variant of document.querySelectorAll(".reladraw-variant")) {
    assert.equal(variant.querySelectorAll(":scope > .reladraw-zoom-controls").length, 1);
  }
});

test("attaching twice does not add a second set of controls", () => {
  const document = diagramDocument();
  attachZoomToVariants(document);
  attachZoomToVariants(document);
  assert.equal(document.querySelectorAll(".reladraw-zoom-controls").length, 2);
});

test("a variant without an svg is skipped", () => {
  const document = new JSDOM('<body><div class="reladraw-variant" data-variant="dark"></div></body>').window
    .document;
  attachZoomToVariants(document);
  assert.equal(document.querySelectorAll(".reladraw-zoom-controls").length, 0);
  assert.equal(document.querySelector(".reladraw-variant")!.hasAttribute("data-zoom"), false);
});

test("re-attaching after data-zoom is stripped does not leave a stale listener holding stale state", () => {
  const document = diagramDocument();
  const window = document.defaultView!;
  attachZoomToVariants(document);
  const variant = document.querySelector(".reladraw-variant")!;
  const svg = variant.querySelector("svg")!;
  const rect = { width: 100, height: 100, top: 0, left: 0, right: 100, bottom: 100, x: 0, y: 0, toJSON() {} };
  variant.getBoundingClientRect = () => rect;

  variant.dispatchEvent(new window.WheelEvent("wheel", { ctrlKey: true, deltaY: -1, bubbles: true, cancelable: true }));
  assert.match(svg.style.transform, /scale\(1\.2\)/);

  variant.removeAttribute("data-zoom");
  variant.querySelector(".reladraw-zoom-controls")?.remove();
  attachZoomToVariants(document);
  assert.equal(variant.querySelectorAll(":scope > .reladraw-zoom-controls").length, 1);

  variant.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true }));
  assert.equal(variant.classList.contains("reladraw-zoom-dragging"), false);
});
