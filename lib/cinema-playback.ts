import type { YouTubePlayer } from "./youtube-player";

// Only issue transport commands when intent changes. In particular, a startup
// timestamp of zero while buffering must never trigger another seek request.
export function cinemaPlayback(player: YouTubePlayer, start: number, end: number) {
  let ready = false, wanted = false, seeking = false;
  const apply = () => {
    if (!ready) return;
    if (wanted) player.playVideo();
    else player.pauseVideo();
  };
  const loop = () => {
    if (!ready || !wanted || seeking) return;
    seeking = true;
    player.seekTo(start, true);
    player.playVideo();
  };
  return {
    ready() { ready = true; player.mute(); apply(); },
    visibility(next: boolean) {
      if (wanted === next) return;
      wanted = next;
      apply();
    },
    state(state: number) { if (state === 0) loop(); },
    sample() {
      if (!ready) return { state: -1, time: 0 };
      const state = player.getPlayerState(), time = player.getCurrentTime();
      if (seeking && state === 1 && time < end - 1) seeking = false;
      if (state === 1 && time >= end) loop();
      return { state, time };
    },
    resume() { if (ready && wanted) player.playVideo(); },
  };
}
