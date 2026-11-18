// node preview.mjs <Comp> <frames comma> <outprefix> [scale]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const [comp, frames, out, scale='0.5'] = process.argv.slice(2);
const B='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable: B});
for (const fr of frames.split(',').map(Number)) {
  await renderStill({serveUrl, composition, frame: fr, output: `${out}_${fr}.png`, scale: Number(scale), browserExecutable: B});
}
console.log('ok');
