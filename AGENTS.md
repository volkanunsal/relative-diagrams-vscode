# AGENTS.md

Relative Diagrams is a VS Code extension that renders Reladraw diagrams in the Markdown preview.

## Setup

- Package manager is pnpm. Run `pnpm install` after cloning.
- Node 20+ (`engines.node` in `package.json`).

## Common commands

- `pnpm test` runs the test suite (`node --test` over `test/*.test.ts`).
- `pnpm run compile` typechecks with `tsc`, then bundles with esbuild. It also runs as `vscode:prepublish`.
- `pnpm run grammar` regenerates `syntaxes/reladraw.tmLanguage.json` from the installed `reladraw` package.
- `pnpm run package` builds the `.vsix` with `vsce package --no-dependencies`.

Run `pnpm run compile` and `pnpm test` before committing. Both must pass.

To run one test file, use `pnpm exec node --test --import tsx test/<file>.test.ts`. Without `--import tsx`, `node --test` cannot run TypeScript.

## Layout

- `src/extension.ts` is the entry point. It registers the markdown-it plugin and the diagnostics provider.
- `src/markdownItPlugin.ts` replaces `reladraw` fences with `renderFence` output and passes other fences to the default rule.
- `src/renderFence.ts` compiles a fence into four theme variants, into one when the fence names a theme, or into an error card.
- `src/namespaceIds.ts` prefixes `id="…"` and `url(#…)` in each SVG so ids stay unique across the page.
- `src/diagnostics/` finds fences in a document and turns compile errors into editor diagnostics.
- `src/grammar/buildGrammar.ts` and `scripts/writeGrammar.ts` build the TextMate grammar from Reladraw's exported `PATTERNS`, which is itself assembled from `STATEMENT_KEYWORDS` and `RELATION_WORDS` inside reladraw.
- `src/previewScript.ts`, `src/attachZoom.ts`, and `src/zoomPan.ts` add zoom and pan in the preview. esbuild bundles them into `media/previewScript.js`.
- `media/previewStyles.css` picks the visible theme variant from the preview's body class and styles the error card and zoom controls.
- `media/logo-source.svg` is the source for `media/icon.png` and `media/logo.png`.
- `syntaxes/` holds the generated Reladraw grammar and the Markdown injection grammar.
- `test/` has a test file for most `src/` modules, with the same basename. Beyond those, `examples.test.ts` renders every fixture in `test/fixtures/examples/`, `grammar.test.ts` covers the generated grammar, `previewStyles.test.ts` covers the stylesheet, and `manifest.test.ts` and `publishing.test.ts` check `package.json`, the icon, and the README.
- `examples/` holds Markdown files for manual checks in the Extension Development Host.
- `docs/images/` holds the README screenshots.

`dist/`, `media/previewScript.js`, and `media/previewScript.js.map` are gitignored build outputs. Do not edit them.

## Rules

- Any user-visible change to `contributes` in `package.json`, or any change to the theme mapping in `media/previewStyles.css` or `src/renderFence.ts`, updates `README.md` in the same commit.
- `reladraw` is pinned to an exact version. `.github/dependabot.yml` opens a weekly PR when a new version is released, scoped to only that dependency; CI runs the full suite (including the grammar-freshness check and `test/examples.test.ts`) on it like any other PR, so a breaking reladraw release fails loudly instead of merging silently. `.github/workflows/dependabot-auto-version.yml` pushes a patch version bump onto that same PR, so merging it both updates reladraw and prepares the next marketplace release — publishing itself still only happens when the merge lands on `main`, since that's what `publish.yml` watches. To upgrade it, whether from that PR or by hand:
  1. Run `pnpm run grammar` and commit the regenerated grammar.
  2. Run `pnpm exec node --test --import tsx test/examples.test.ts` and fix any failure.
  3. Re-check the id-reference forms in `node_modules/reladraw/dist/render.js`. `src/namespaceIds.ts` rewrites only `id="…"` and `url(#…)`, so any new form of internal id reference needs handling there.
- README images use absolute URLs, and this repo's own images use `https://raw.githubusercontent.com/volkanunsal/relative-diagrams-vscode/main/…`. `test/publishing.test.ts` enforces this.
- Add no code comments beyond those tooling requires.
- Keep commit messages short and imperative.
