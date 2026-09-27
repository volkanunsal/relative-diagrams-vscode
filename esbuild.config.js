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

  if (watchMode) {
    await extensionContext.watch();
  } else {
    await extensionContext.rebuild();
    await extensionContext.dispose();
  }
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
