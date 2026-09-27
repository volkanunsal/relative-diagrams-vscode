const esbuild = require("esbuild");

const watchMode = process.argv.includes("--watch");

async function build() {
  const extensionContext = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node18",
    external: ["vscode"],
    outfile: "dist/extension.js",
    sourcemap: true,
    minify: !watchMode,
  });

  const previewScriptContext = await esbuild.context({
    entryPoints: ["src/previewScript.ts"],
    bundle: true,
    platform: "browser",
    format: "iife",
    target: "es2020",
    outfile: "media/previewScript.js",
    sourcemap: true,
    minify: !watchMode,
  });

  if (watchMode) {
    await extensionContext.watch();
    await previewScriptContext.watch();
  } else {
    await extensionContext.rebuild();
    await previewScriptContext.rebuild();
    await extensionContext.dispose();
    await previewScriptContext.dispose();
  }
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
