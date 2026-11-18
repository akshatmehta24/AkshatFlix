#!/bin/bash
# master.sh <video.mp4> <audio.wav> <out.mp4>  — 2-pass loudnorm to -14 LUFS / -1.5 dBTP, then mux
set -e
V=$1; A=$2; O=$3
J=$(ffmpeg -hide_banner -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$A" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le "${A%.wav}_master.wav"
ffmpeg -v error -y -i "$V" -i "${A%.wav}_master.wav" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a aac -b:a 320k -ac 2 -shortest "$O"
ffmpeg -hide_banner -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:|LRA:)" | tr -s ' ' | tr '\n' ' '; echo
