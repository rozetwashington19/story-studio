#!/usr/bin/env bash
# One-time setup for a fresh workspace (about 2-4 minutes). Safe to re-run.
set -e
cd "$(dirname "$0")"
pip install --break-system-packages -q "sherpa-onnx<2" soundfile numpy pillow playwright 2>&1 | grep -v -i warn || true
[ -d node_modules/three ] || npm install --silent three@0.170.0
mkdir -p ~/models
if [ ! -f ~/models/kokoro-en-v0_19/model.onnx ]; then
  curl -sSL -o /tmp/kokoro.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-en-v0_19.tar.bz2
  tar xjf /tmp/kokoro.tar.bz2 -C ~/models && rm /tmp/kokoro.tar.bz2
fi
if [ ! -f ~/models/sherpa-onnx-zipvoice-distill-zh-en-emilia/fm_decoder.onnx ]; then   # narrator voice clone model (~600 MB)
  curl -sSL -o /tmp/zv.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/sherpa-onnx-zipvoice-distill-zh-en-emilia.tar.bz2
  tar xjf /tmp/zv.tar.bz2 -C ~/models && rm /tmp/zv.tar.bz2
fi
pip install --break-system-packages -q librosa 2>&1 | grep -v -i warn || true
command -v ffmpeg >/dev/null || { echo "ffmpeg missing"; exit 1; }
ls /usr/bin/google-chrome /usr/bin/chromium /usr/bin/chromium-browser 2>/dev/null | head -1 || python3 -m playwright install chromium
fc-list | grep -q "Inter-Black" || echo "WARNING: Inter font not found; captions need /usr/share/fonts/opentype/inter/"
echo "setup ok"
