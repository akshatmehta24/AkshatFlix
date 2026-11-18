#!/bin/bash
# usage: render.sh <comp> <out> [extra args]
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion "${CMD:-render}" src/index.ts "$1" "$2" --browser-executable=$B --log=error "${@:3}"
