"use client";

import { useEffect, useRef, useState } from "react";
import { loadYouTubePlayer, type YouTubePlayer } from "@/lib/youtube-player";
import { cinemaPlayback } from "@/lib/cinema-playback";

type Props = { image: string; id: string; start?: number; end?: number; className?: string; priority?: boolean; paused?: boolean; label: string; aperture?: number };

export function CinemaMedia({ image, id, start, end, className = "", priority = false, paused = false, label, aperture = 2.39 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const localVideo = useRef<HTMLVideoElement>(null);
  const transport = useRef<ReturnType<typeof cinemaPlayback> | null>(null);
  const visible = useRef(false);
  const pausedRef = useRef(paused);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [localPlaying, setLocalPlaying] = useState(false);
  const [mediaState, setMediaState] = useState("idle");
  const localSource = id === "FbXOsVByKmk" ? "firestorm" : priority || id === "_8J8LwoVH_0" ? "katana" : "entrance";
  const loopStart = start ?? (id === "_8J8LwoVH_0" ? 100 : id === "FbXOsVByKmk" ? 52 : 42);
  const loopEnd = end ?? loopStart + 21;

  useEffect(() => {
    pausedRef.current = paused;
    transport.current?.visibility(visible.current && !paused);
  }, [paused]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const sizeVideo = () => {
      const planeWidth = Math.max(element.clientWidth, element.clientHeight * aperture);
      element.style.setProperty("--film-width", `${planeWidth}px`);
      element.style.setProperty("--film-height", `${planeWidth * 9 / 16}px`);
    };
    const resize = new ResizeObserver(sizeVideo);
    resize.observe(element);
    sizeVideo();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => resize.disconnect();
    if (priority) setActive(true);
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting && entry.intersectionRatio >= .08;
      if (visible.current) setActive(true);
      transport.current?.visibility(visible.current && !pausedRef.current);
    }, { threshold: [0, .08] });
    // Cue nearby players, but autoplay only the visible film. Distant sections
    // no longer create six competing video downloads at page load.
    const prepare = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setActive(true);
    }, { rootMargin: "100% 0px" });
    observer.observe(element);
    prepare.observe(element);
    const resume = () => transport.current?.resume();
    window.addEventListener("og-showcase-play", resume);
    return () => {
      resize.disconnect(); observer.disconnect(); prepare.disconnect();
      window.removeEventListener("og-showcase-play", resume);
    };
  }, [priority, aperture]);

  // Bundled clips provide immediate motion while the full YouTube excerpt loads.
  // Keep the original streaming layer and switch only after it has moving frames.
  useEffect(() => {
    const video = localVideo.current;
    const element = root.current;
    if (!active || !video || !element) return;
    video.muted = true;
    let lastTime = 0;
    const sync = () => {
      const shouldPlay = visible.current && !pausedRef.current && !playing && !document.hidden && getComputedStyle(element).visibility !== "hidden";
      if (shouldPlay && video.paused) void video.play().catch(() => setLocalPlaying(false));
      else if (!shouldPlay) {
        setLocalPlaying(false);
        if (!video.paused) video.pause();
      }
    };
    const progress = () => {
      if (!video.paused && video.currentTime !== lastTime) {
        setLocalPlaying(true);
        if (!playing) element.dataset.filmTime = video.currentTime.toFixed(2);
      }
      lastTime = video.currentTime;
    };
    const stopped = () => setLocalPlaying(false);
    video.addEventListener("timeupdate", progress);
    video.addEventListener("pause", stopped);
    video.addEventListener("waiting", stopped);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("og-showcase-play", sync);
    const interval = window.setInterval(sync, 250);
    sync();
    return () => {
      clearInterval(interval);
      video.removeEventListener("timeupdate", progress);
      video.removeEventListener("pause", stopped);
      video.removeEventListener("waiting", stopped);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("og-showcase-play", sync);
      video.pause();
    };
  }, [active, playing, localSource]);

  useEffect(() => {
    if (!active || !host.current) return;
    let disposed = false, player: YouTubePlayer | undefined;
    let lastTime = 0, movingSamples = 0;
    let timer: number | undefined;
    const element = root.current!;
    const mount = document.createElement("div");
    host.current.appendChild(mount);
    setMediaState("loading");
    const fail = () => { if (!disposed) { setPlaying(false); setMediaState("unavailable"); } };
    loadYouTubePlayer().then(YT => {
      if (disposed) return;
      player = new YT.Player(mount, {
        videoId: id,
        playerVars: { autoplay: 0, mute: 1, playsinline: 1, controls: 0, disablekb: 1, rel: 0, start: loopStart, iv_load_policy: 3, origin: window.location.origin },
        events: {
          onReady(event) {
            if (disposed) return;
            const control = cinemaPlayback(event.target, loopStart, loopEnd);
            transport.current = control;
            control.visibility(visible.current && !pausedRef.current);
            control.ready();
            setMediaState("ready");
            timer = window.setInterval(() => {
              control.visibility(visible.current && !pausedRef.current && getComputedStyle(element).visibility !== "hidden" && !document.hidden);
              const { state, time } = control.sample();
              element.dataset.filmTime = time.toFixed(2);
              if (state === 1 && time > lastTime + .08) movingSamples++;
              else movingSamples = 0;
              lastTime = time;
              // API readiness alone is not proof that decoded footage is moving.
              const moving = movingSamples >= 3 && visible.current && !pausedRef.current;
              if (moving) { setPlaying(true); setMediaState("playing"); }
              else if (state !== 1) { setPlaying(false); setMediaState(state === 3 ? "buffering" : state === 2 ? "paused" : "ready"); }
            }, 250);
          },
          onStateChange(event) {
            if (disposed) return;
            transport.current?.state(event.data);
            if (event.data !== 1) { movingSamples = 0; setPlaying(false); }
            if (event.data === 3) setMediaState("buffering");
          },
          onError: fail,
          onAutoplayBlocked() { if (!disposed) { setPlaying(false); setMediaState("blocked"); } },
        },
      });
      const iframe = host.current?.querySelector("iframe");
      if (iframe) {
        iframe.title = `${label} — muted background film`;
        iframe.tabIndex = -1;
        iframe.setAttribute("aria-hidden", "true");
        iframe.setAttribute("allow", "autoplay; encrypted-media");
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
      }
    }).catch(fail);
    return () => {
      disposed = true;
      if (timer !== undefined) clearInterval(timer);
      transport.current = null;
      player?.destroy();
      mount.remove();
    };
  }, [active, id, loopStart, loopEnd, label]);

  return <div className={`cinema-media ${className}`} ref={root} data-playing={playing || localPlaying} data-stream-playing={playing} data-local-playing={localPlaying} data-paused={paused} data-media-state={playing ? "playing" : localPlaying ? "playing-local" : mediaState} data-priority={priority}>
    <img src={`/media/${image}`} alt={label} width="2048" height="1152" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} draggable={false} />
    {active && <video ref={localVideo} className="cinema-local-video" src={`/media/video/${localSource}.mp4`} muted loop playsInline preload={priority ? "auto" : "metadata"} aria-hidden="true" />}
    <div className="cinema-player" ref={host} />
  </div>;
}
