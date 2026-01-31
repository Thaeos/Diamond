#!/usr/bin/env bash
# Install source-language fonts: Aramaic, Syriac, Greek (system), Demotic/Egyptian
# We use source languages: Imperial Aramaic, Syriac, Greek, Demotic/Egyptian

set -e
FONT_DIR="${HOME}/.local/share/fonts/source-languages"
BASE_URL="https://github.com/notofonts/noto-fonts/raw/main/hinted/ttf"

mkdir -p "$FONT_DIR"
cd "$FONT_DIR"

echo "Installing Noto Sans Imperial Aramaic..."
curl -sL -o NotoSansImperialAramaic-Regular.ttf "$BASE_URL/NotoSansImperialAramaic/NotoSansImperialAramaic-Regular.ttf"

echo "Installing Noto Sans Syriac..."
curl -sL -o NotoSansSyriac-Regular.ttf "$BASE_URL/NotoSansSyriac/NotoSansSyriac-Regular.ttf"

echo "Installing Noto Sans Egyptian Hieroglyphs..."
curl -sL -o NotoSansEgyptianHieroglyphs-Regular.ttf "$BASE_URL/NotoSansEgyptianHieroglyphs/NotoSansEgyptianHieroglyphs-Regular.ttf"

echo "Installing Noto Sans Coptic..."
curl -sL -o NotoSansCoptic-Regular.ttf "$BASE_URL/NotoSansCoptic/NotoSansCoptic-Regular.ttf"

echo "Refreshing font cache..."
fc-cache -f "$FONT_DIR"

echo "Done. Fonts in $FONT_DIR (Greek: use system DejaVu or Noto Sans)."
