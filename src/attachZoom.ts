import { attachZoomPan } from "./zoomPan";

const abortControllers = new WeakMap<Element, AbortController>();

export function attachZoomToVariants(root: ParentNode): void {
  for (const variant of root.querySelectorAll<HTMLElement>(".reladraw-variant:not([data-zoom])")) {
    const svg = variant.querySelector("svg");
    if (!svg) {
      continue;
    }
    abortControllers.get(variant)?.abort();
    variant.querySelector(":scope > .reladraw-zoom-controls")?.remove();
    const RealmAbortController = variant.ownerDocument.defaultView!.AbortController;
    const controller = new RealmAbortController();
    abortControllers.set(variant, controller);
    variant.setAttribute("data-zoom", "attached");
    attachZoomPan(variant, variant, svg, controller.signal);
  }
}
