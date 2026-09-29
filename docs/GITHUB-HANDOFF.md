# GitHub handoff — 29 September 2026

Based on hosted website source commit `9a6eb42e8c3173db5160506af22ca0b6d4c41096`.

This portable edition retains the visual composition, copy, scroll timeline, interactions and original YouTube players. Default package scripts run standard Next.js for external deployment; original Sites scripts remain under `*:sites`.

Five locally available promotional MP4s are bundled. Three are integrated as visibility-controlled autoplay fallbacks while original YouTube streams load. These are standard-definition teaser loops, not complete film downloads. The full films remain external YouTube embeds and links. See `local-video-sources.json` for provenance.

No generated demo export or decoded frame caches are required by the website. All website source and media are included; dependencies and production output are regenerated from the lockfile. The original hosted deployment is not changed by this GitHub handoff.

## Verification

- Production Next.js build completed successfully and prerendered the home page.
- TypeScript validation and existing playback regression check passed.
- In the browser preview, the opening native clip played automatically with readyState 4 and advancing time. The global pause control stopped it, and resume restarted it.
- Index navigation reached the footer; its Firestorm clip played with readyState 4 and advancing time while off-screen clips were paused.
- The original YouTube layer still could not deliver decoded frames in this cloud environment; its local fallback supplied the visible motion.
