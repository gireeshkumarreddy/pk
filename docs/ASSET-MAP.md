# Asset mapping

- Opening / circular hero exit: official Hungry Cheetah glimpse, `7Y5q41D8_hs`, configured as a 42–64 second excerpt; katana entrance still (`OG011.webp`, 3840×1602).
- Orbit: ten authentic promotional images featuring the dual guns, rain pistol, katana, close-up eyes, flaming chair, car, sword fight, katana entrance, welding and red silhouette. The archive revolves around the rotating OG movie title.
- Portrait-frame reveal: Pawan portrait, then red action frame.
- Full-screen story bridge: official Hungry Cheetah glimpse (`7Y5q41D8_hs`); red action still fallback.
- Dark constellation and cascading films: three official films (Hungry Cheetah, Firestorm `FbXOsVByKmk`, trailer); their associated film imagery.
- Ending: actual brushed OG movie title, plus the black Dodge promotional scene as a separate cinematic title card.
- Logo: original transparent film-title artwork from the publicly linked PNG, cropped with CSS to its OG symbol. Header and red-background versions use a monochrome display filter.

The katana hero is encoded as WebP at its original 3840×1602 dimensions, quality 86. Other high-resolution originals are capped at 1800 pixels on their longest side and encoded at quality 82 for the smaller orbit panels. No images are upscaled. Pixel dimensions do not establish the original capture resolution. Background excerpts use a cinema crop, muted playback, delayed reveal, explicit start/end points and poster fallbacks; the controlled full-film dialog retains the official player.

Official YouTube streaming quality is adaptive. Local fallback images stay at their native pixel dimensions and are not upscaled. Backgrounds play muted inline; posters remain underneath. Full films are opened in an accessible modal and also linked directly to YouTube. No soundtrack from the unrelated reference recording is reused.

Detailed source provenance is retained in `docs/assets.json`, `docs/assets-update.json` and `docs/action-still-sources.json`. Public promotional availability does not transfer copyright; these remain the respective film/music owners' materials.

## Footer video revision

The footer now embeds Sony Music South’s official Firestorm lyric video, `FbXOsVByKmk`, from 52–84 seconds, muted and looping. The source provides adaptive formats up to 3840×2160; actual playback quality remains controlled by YouTube. The complete 16:9 frame is retained on mobile. The high-resolution dual-gun promotional image and OG logo provide a gently animated fallback; this drift respects the global pause and reduced-motion setting. The overlay fades when playback starts. Source and verification limits are in `docs/footer-video.json`.

## Cinematic showcase export

`tools/video/render-showcase.mjs` creates a deterministic 40-second, 1920×1080, 60 fps video of the site’s artwork and compositions. It animates the opening, circular transition, orbit and title rotation, red sweep, portrait reveal, action image, chapter gallery and footer. It is a silent artwork animation, not a live browser recording or an extraction of streaming movie footage. Output MP4 files are saved outside the site checkout.
