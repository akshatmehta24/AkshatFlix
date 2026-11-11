// Renders a contact sheet of sample frames for one template.
// Usage: node tools/preview.mjs Template2 [count] [outDir]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [id, countArg, outArg] = process.argv.slice(2);
const count = Number(countArg ?? 18);
const outDir = outArg ?? "out/preview";
fs.mkdirSync(outDir, { recursive: true });
const browserExecutable = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
const files = [];
for (let i = 0; i < count; i++) {
  const frame = Math.round(((i + 0.5) / count) * (composition.durationInFrames - 1));
  const output = path.join(outDir, `${id}-${String(i).padStart(2, "0")}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", scale: 0.25, browserExecutable });
  files.push(output);
}
const cols = 6;
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(outDir, `${id}-%02d.jpg`), "-vf", `tile=${cols}x${Math.ceil(count / cols)}:padding=4`, "-frames:v", "1", path.join(outDir, `${id}-sheet.jpg`)]);
console.log(path.join(outDir, `${id}-sheet.jpg`));
