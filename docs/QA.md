# Review — 29 September 2026

## Verified

- TypeScript check passed without errors.
- Production bundle builds successfully.
- Desktop browser: hero, shrinking scene plane, floating mosaic, red narrative composition, film gallery and ending implemented and inspected.
- Local images all loaded; no horizontal overflow at the inspected 1363-pixel viewport.
- Chapter menu opens, closes and moves to the films section.
- Film card opens an accessible dialog containing the correct official YouTube player and direct link.
- Dialog closes; header logo returns to the opening.
- Initial headline reveal fixed after browser inspection; final implementation uses a CSS animation independent of scroll-timeline state.
- Header theme calculation changed to derive from absolute scroll position, including reverse navigation.
- Reduced-motion CSS provides a linear alternative without pinning; default motion uses native scrolling and scrub smoothing.
- Mobile CSS uses wider central frame, fewer peripheral images, touch-sized controls and revised copy placement.

## Revision checks

- Inspected the new katana entrance and authentic title crop in the desktop preview.
- Inspected the round exit and two subsequent orbit positions. Computed transforms confirm that the archive, center title and red crescent change rotation with scroll.
- Inspected the footer car scene with the actual OG title. All images loaded and the inspected 1348-pixel viewport had no horizontal overflow.
- High-resolution promotional originals are encoded as WebP; the hero retains its pixel dimensions and orbit images are capped at 1800 pixels on the longest side; unused duplicate downloads are excluded from the site.
- Native video retrieval remains unavailable. Short-loop streaming configuration cannot guarantee that provider chrome never appears or that streams play in every environment.

## Remaining boundaries

- Native 4K assets were not available locally. The official trailer lists a 3840×2160 stream, but the media download returned a “Site Unavailable” response. This was not used as a video asset.
- Official embed chrome loads in the cloud browser, but streaming remains stalled. Actual continuous video playback and adaptive 4K selection cannot be verified here. All background media retains a tested still fallback.
- Mobile layout has responsive source rules, but the available browser interface did not expose a working viewport-resize/mobile-emulation control. No claim of device-tested mobile playback or performance is made.
- Exact original font, loading sequence and final ending cannot be established from the supplied filmed-screen reference.

## Footer video revision

- Replaced the soft third-party title-card upload with the official Sony Music South Firestorm lyric film, looping 52–84 seconds. Public player metadata confirms embedding and adaptive source formats up to 3840×2160.
- Original video aspect ratio is preserved on mobile and desktop; title overlay hides during active playback.
- Explicit `start={0}` now works without falling through to the shared 42-second default.
- The source video stalled in the cloud browser at readyState 0, so exact scene contents and continuous playback remain unverified.

## 40-second showcase

- Reviewed twenty deterministic timeline frames across the opening, circle, rotation, red transition, portrait, action, gallery and footer.
- The export uses the existing site artwork and typography compositions on a fixed 60 fps clock, without pointer input or streaming stalls.
- This is a silent animated artwork showcase; it does not represent recorded browser playback or native movie footage.
- TypeScript check passed after the Firestorm footer substitution.
- Encoded MP4 verified: 40.000 seconds, 1920×1080, 60 fps, 2,400 frames. All adjacent presentation timestamps maintain 1/60-second spacing; a full decode completed without errors.
- Inspected encoded opening, rotation and footer frames. The footer fallback also has a CSS drift animation, paused by the existing playback control and disabled for reduced motion.

## Live autoplay showcase

- Added an opt-in `?showcase=1` route state and a visible “60-second showcase” link. The regular scroll experience remains the default.
- The controller pre-initializes the existing six film players, then runs a 60-second scroll timeline through the entrance, circle, rotating OG title, action panel, gallery and Firestorm footer.
- Scroll positions use monotone cubic interpolation with continuous velocity. Escape, wheel or touch stops the tour. Replay resets each film to its selected segment.
- Players start muted, loop their selected ranges and pause outside the viewport. Initialization handshakes now retry for up to ten seconds to cover delayed player startup.
- A browser recording control records the user's chosen OG tab for the same 60-second sequence, with no extra clips to upload. The browser selects a supported MP4 or WebM format. Actual recording requires a user-selected capture surface and has not been verified in the cloud browser.
- The existing official trailer still buffers at 0:00 in the cloud browser. Native movie playback and a new movie-footage MP4 export therefore cannot be claimed as verified here.
- TypeScript and whitespace checks pass.

- One-minute revision: slower entrance, five seconds across the main action panel, four-second chapter spacing and a six-second footer descent to the complete credits. The recording duration and download filename now match the 60-second timeline.

## 55-second playback correction

- Replaced repeated iframe message handshakes with the official YouTube IFrame API.
- Removed eager autoplay of all six backgrounds. The initial browser inspection confirms one initialized player and five idle media panels. Nearby sections are cued, and visible sections request muted playback.
- Removed startup seeks triggered by a zero timestamp. A regression test exercises 100 buffering samples, repeated loop-end samples and visibility changes; there are no startup seeks, no repeated seeks at the same loop boundary and no repeated pause commands.
- Playback polling checks advancing timestamps over three samples before revealing footage. Hidden scenes and background tabs pause.
- Showcase duration, recording labels and filename now specify 55 seconds. Recording and timeline startup wait for actual opening playback, with a bounded loading message if the source cannot play.
- Cloud preview after correction: opening player initialized at the requested 42-second cue, but the actual video element remains at currentTime 0, readyState 0, paused false and an empty buffered range. A single playback retry did not establish playback. No new movie-footage video export was produced or represented as complete.
