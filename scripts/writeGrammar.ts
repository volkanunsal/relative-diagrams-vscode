import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildGrammar } from "../src/grammar/buildGrammar";

const outputPath = join(__dirname, "..", "syntaxes", "reladraw.tmLanguage.json");
writeFileSync(outputPath, `${JSON.stringify(buildGrammar(), null, 2)}\n`, "utf8");
