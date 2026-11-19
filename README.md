# Vice City Multi-Panel Studio

![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/Velixxyz/gta6-cover-art/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/Velixxyz/gta6-cover-art/reward.svg)

Turn your photos and a caption into multi-panel GTA-style cover art, and export it as a PNG — fully offline in desktop Chrome.

## What it does

- **6 art-directed multi-panel layouts** (Classic Vice, Duo Story, City Nights, Action Grid, Sunset Edition, Minimal Crime) — one hero panel plus 3–5 vignette panels, dark gutters, never a plain photo grid.
- **Any photo**: upload 1–10 photos from your machine (never uploaded anywhere). One photo fills every panel with a different crop; several photos can fill different panels. Each panel keeps its own crop — drag to pan, zoom slider, flip, double-click to reset. Photos are never stretched.
- **4 global grades** (Vice City Sunset, Neon Nights, Tropical Heat, Crime Drama) applied across all panels so the cover reads as one poster, plus code-drawn sunset sky, skyline, palms, film grain and vignette.
- **3-level caption lettering**: big Anton title (max 24 chars, auto-fit), Oswald subtitle, Inter micro-detail; 3 title positions; automatic scrim so text stays readable.
- **Fast**: photo → layout → caption → Export. One click exports 1080×1080, 1080×1350 and 1920×1080 PNGs. Undo/redo included.
- **Offline**: static files under `app/`, no network request. Fonts are bundled SIL OFL files (Anton, Oswald, Inter) with licences in `app/fonts/`.

## Try it

```bash
node serve.ts
# open http://localhost:8080
```

## Screenshots

- `1-cover.jpg` — exported landscape cover (1920×1080)
- `2-editor.jpg` — the editor with a photo loaded
- `3-cover.jpg` — exported square cover (1080×1080)
- `4-cover-portrait.jpg` — exported portrait cover (1080×1350)

Reproducible scenes live in `shots.json` (`?shot=cover|editor&photo=…&caption=…`).

## Originality

Original design and code. No Rockstar Games logo, wordmark, official artwork, character or font is used anywhere. Sample photos (`app/samples/`) were made with an image model for this bounty and are free to use.

## License

MIT — see [LICENSE](LICENSE).
