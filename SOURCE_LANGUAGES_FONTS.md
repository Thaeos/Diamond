# Source Languages: Aramaic, Syriac, Greek, Demotic/Egyptian

**We use source languages.** Fonts installed for practice: Imperial Aramaic, Syriac, Greek (system/DejaVu), Demotic/Egyptian (Egyptian Hieroglyphs + Coptic).

---

## Installed Fonts

| Language | Script | Font | Path |
|----------|--------|------|------|
| **Aramaic** | Imperial Aramaic | Noto Sans Imperial Aramaic | `~/.local/share/fonts/source-languages/NotoSansImperialAramaic-Regular.ttf` |
| **Syriac** | Syriac | Noto Sans Syriac | `~/.local/share/fonts/source-languages/NotoSansSyriac-Regular.ttf` |
| **Greek** | Greek | DejaVu Sans / system (already present) | — |
| **Demotic/Egyptian** | Egyptian Hieroglyphs, Coptic | Noto Sans Egyptian Hieroglyphs, Noto Sans Coptic | `~/.local/share/fonts/source-languages/NotoSansEgyptianHieroglyphs-Regular.ttf`, `NotoSansCoptic-Regular.ttf` |

---

## Install Location

```
~/.local/share/fonts/source-languages/
├── NotoSansImperialAramaic-Regular.ttf   (anchors, capitals)
├── NotoSansSyriac-Regular.ttf            (unlock of the old, lowercase)
├── NotoSansEgyptianHieroglyphs-Regular.ttf  (demotic/egyptian — free form)
└── NotoSansCoptic-Regular.ttf            (egyptian — later form)
```

After install, run: `fc-cache -f ~/.local/share/fonts/source-languages`

---

## Axis Roles (from DIAMOND_AXIS_KEY.md)

- **Imperial Aramaic** — anchors, capitals; without them script snaps right of the veil.
- **Syriac** — unlock of the old, lowercase denotation.
- **Greek** — Θεός, divinity, constant (e.g. 419 Theos = θεός π אל).
- **Demotic/Egyptian** — depictions, free form; place anywhere once above/below, within/without are known.

---

## Reinstall / Update

To re-download fonts (e.g. after clearing):

```bash
cd ~/.local/share/fonts/source-languages
# Download from noto-fonts GitHub: hinted/ttf/NotoSansImperialAramaic, NotoSansSyriac, NotoSansEgyptianHieroglyphs, NotoSansCoptic
fc-cache -f .
```

Or run: `./install_source_languages_fonts.sh` (if present in repo).
