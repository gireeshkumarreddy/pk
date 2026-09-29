# OG — reference analysis and motion blueprint

Source: supplied WhatsApp recording, 624 × 480, 60 fps, 14.205 s. The recording shows a screen and social UI; these are not part of the website. There is no recorded loading sequence, hover action or original final footer. Durations below describe the screen recording, not guaranteed durations in the source site. All 852 frames were extracted for the review; representative states were reviewed at 1/3-second intervals and key transitions at native resolution.

## Observed sequence and adaptation

| Reference time | Observed composition and motion | OG treatment / start → end | Scroll and playback |
|---|---|---|---|
| 0–0.8 s | Full viewport footage, large white sans-serif headline at left. Camera backs out of the image. | Pawan promotional still with official trailer playback; oversized white title. Full-viewport panel contracts into the mosaic. | First 12% of pinned journey; power2.inOut, no scroll lock. |
| 0.8–2.5 s | Cream canvas, 12+ rectangular images of mixed sizes at different depths; small symbol in center. Images spread across viewport. | Authentic OG image constellation; hollow red OG title at center. Hero becomes one tile. | 12–28%; depth implied by different scales, positions and staggered movement. |
| 2.5–4.2 s | Bright yellow background expands. Images retreat to edges around central black statement. | Saturated theatrical red replaces yellow under explicit OG colour direction. White central narrative; tiles still surrounding it. | 28–43%; scale reveal, transform/opacity, reverse works. |
| 4.2–5.0 s | Short statement alone; last tiles leave bottom. | “The storm returns.” isolated on red. | 43–51%; images exit before heading holds. |
| 5.0–7.4 s | Bright plane moves up; cream returns. Central bright rectangle slides down inside delicate offset outline; minimal side annotations. | Red frame contracts to portrait-sized rectangle. Offset fine-line frame; Ojas Gambheera label. | 51–73%; vertical wipe then rectangle contraction. |
| 7.4–9.0 s | Image reveals in central rectangle; text crosses frame and builds into stacked words; scene images replace one another. | OG character portraits with “The man / The myth / The storm” layered across the frame. | 73–100%; mask reveal and crossfades. |
| 9.0–10.5 s | Landscape rises from below and fills screen. Minimal copy at top right; image continues under following section. | Authentic OG action scene / official glimpse playback with right-aligned copy. | Separate pinned section with bottom-up reveal and parallax. |
| 10.5–11.6 s | Black surface replaces landscape; paragraph left and five small images distributed right. Images pull into vertical alignment. | Black OG world section. Five stills gather toward a central column. | Scrubbed dark section, 3D rotations settle as tiles align. |
| 11.6–14.205 s | Stacked cinematic banners, enormous light headings above/over each image, sequential vertical reveals. Clip ends mid-gallery. | Three cinematic OG chapters: Hungry Cheetah / Firestorm / They Call Him OG. Red OG end card extends the incomplete reference ending. | Natural scroll with per-banner translate/scale; official media accessible in player. |

## Global direction

- Preserve the reference's negative space, tiny centered logo, unrounded rectangular panels, large neutral sans-serif type, alternating light/bright/dark fields, and continuous reversibility.
- Palette: paper #eeeae4, ink #11100f, vermilion #da271b. Red is a deliberate adaptation of source yellow, not an assertion of exact colour replication.
- The reference's original font cannot be reliably identified from the low-resolution filmed screen. Use a tight neutral system sans-serif. The OG mark uses the actual brushed movie-title artwork.
- Opening title reveal is a 2.4-second interpretation because the recording starts after loading. No blocking progress counter or autoplay sound gate.
- Scroll is native. GSAP ScrollTrigger numeric scrub adds ~0.55 s catch-up, with no forced snapping or wheel interception.
- Main composition uses CSS 3D transforms/perspective; no unnecessary WebGL download. Hover accent limited to chapter media and controls, as no cursor effect is evident in the source.
- Mobile uses wider central panels, fewer peripheral tiles, large enough touch targets and no forced horizontal scrolling. Reduced motion replaces pinning with a readable linear narrative.
- Sound: muted autoplay; audio enabled only through explicit player interaction. The screen recording has audio but does not establish reliable synchronization between the source website and the recording soundtrack.
- Video playback is independent of scroll; scroll transforms the video plane and never repeatedly seeks the streaming video. Poster fallback stays underneath to prevent blank loading frames.

## Known boundaries

The supplied reference is SD screen footage. Native 4K promotional footage is not supplied. Official streaming embeds use the provider's adaptive quality; verified local promotional images are delivered at their actual resolution without upscaling. The experience must not label these assets native 4K. Pixel-perfect matching of the font, music, hidden loading sequence, and unrecorded ending is not verifiable from this recording.

## User-requested motion revision

The opening now contracts through a circular mask. Ten action images rotate around the center by 210 degrees, with individual tilted planes, while the actual OG title makes a full turn. A separate red crescent rotates and grows before the red field fills the screen through an expanding circle. The red field exits through a contracting circular mask. A car-scene title card reveals in the footer. These replace the first version's non-rotating mosaic and typographic title treatment described in the initial adaptation table above.

Background films are configured as short excerpts (opening 42–64 s, story bridge 59–78 s, chapter loops 21 s). A cover-sized cinema plane removes the embedded-video frame from the composition. The poster hides startup/buffering states and remains the fallback if playback fails. These still depend on official YouTube streaming; no local master-video file is available.
