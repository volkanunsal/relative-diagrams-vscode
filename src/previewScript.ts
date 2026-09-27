import { attachZoomToVariants } from "./attachZoom";

attachZoomToVariants(document);

new MutationObserver(() => {
  attachZoomToVariants(document);
}).observe(document.body, { childList: true, subtree: true });
