# Changelog

## 0.2.0

- Highlights Reladraw syntax in a standalone `.reladraw` file, not just inside a Markdown fence. Comment toggling and bracket matching work too. There is still no preview for a standalone file.

## 0.1.0

- Renders `reladraw` code fences (backtick or tilde) as diagrams in the VS Code Markdown preview, using the bundled `reladraw` 0.8.0.
- Matches each diagram to the editor's Light, Dark, High Contrast, or High Contrast Light theme, and switches instantly when the editor theme changes.
- Keeps a diagram's own palette when its fence has a `diagram theme:` line.
- Shows an error card in the preview for a fence that fails to compile, with the failing line highlighted, while other fences on the page keep rendering.
- Marks the failing line in the editor with an error diagnostic, updated 300 ms after the last edit, including for fences inside lists and blockquotes and files with CRLF line endings.
- Highlights Reladraw syntax inside `reladraw` fences in the Markdown editor.
- Adds zoom buttons, `Ctrl`/`Cmd` + wheel zoom, and drag-to-pan to each diagram.
- Keeps scroll sync and double-click-to-source working for diagrams and error cards.

Known limitation: A relative `url:` link in a diagram does nothing when clicked in the preview. Absolute links open in the browser.
