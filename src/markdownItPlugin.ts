import type * as MarkdownItModule from "markdown-it";
import { renderFence } from "./renderFence";

export type MarkdownItInstance = ReturnType<typeof MarkdownItModule.default>;
type FenceRule = NonNullable<MarkdownItInstance["renderer"]["rules"]["fence"]>;

export const FENCE_LANGUAGE = "reladraw";

export function reladrawPlugin(markdownItInstance: MarkdownItInstance): MarkdownItInstance {
  const defaultFenceRenderer = markdownItInstance.renderer.rules.fence!.bind(
    markdownItInstance.renderer.rules,
  );

  const reladrawFenceRenderer: FenceRule = (tokens, tokenIndex, options, env, self) => {
    const token = tokens[tokenIndex];
    if (token.info.trim().toLowerCase() !== FENCE_LANGUAGE) {
      return defaultFenceRenderer(tokens, tokenIndex, options, env, self);
    }
    return renderFence(token.content, tokenIndex, undefined, token.map?.[0]);
  };

  markdownItInstance.renderer.rules.fence = reladrawFenceRenderer;
  return markdownItInstance;
}
