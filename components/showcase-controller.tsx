"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DURATION = 55;
type Cue = { time: number; y: number };

function timeline(): Cue[] {
  const h = window.innerHeight;
  const top = (selector: string) => document.querySelector<HTMLElement>(selector)!.getBoundingClientRect().top + window.scrollY;
  const journey = document.querySelector<HTMLElement>(".journey")!.offsetHeight - h;
  const max = document.documentElement.scrollHeight - h;
  const chapters = [...document.querySelectorAll<HTMLElement>(".film-chapter")];
  const cues: Cue[] = [
    { time: 0, y: 0 }, { time: 3, y: 0 }, { time: 7, y: journey * .045 },
    { time: 11, y: journey * .24 }, { time: 16, y: journey * .40 },
    { time: 19, y: journey * .57 }, { time: 22, y: journey * .74 },
    { time: 25, y: journey }, { time: 27, y: top(".wide-scene") },
    { time: 31, y: top(".wide-scene") + h * .3 },
    { time: 35, y: top(".world") + document.querySelector<HTMLElement>(".world")!.offsetHeight - h },
    ...chapters.map((el, i) => ({ time: 37 + i * 4, y: el.getBoundingClientRect().top + window.scrollY - 75 })),
    { time: 49, y: top(".end-card") },
    { time: DURATION, y: max },
  ];
  return cues.map((cue, i) => ({ ...cue, y: Math.max(i ? cues[i - 1].y : 0, Math.min(max, cue.y)) }));
}

// Monotone cubic interpolation keeps velocity continuous across section boundaries.
function position(cues: Cue[], t: number) {
  const slopes = cues.slice(1).map((cue, i) => (cue.y - cues[i].y) / (cue.time - cues[i].time));
  const tangents = cues.map((_, i) => {
    if (!i || i === cues.length - 1) return 0;
    const a = slopes[i - 1], b = slopes[i];
    return a > 0 && b > 0 ? 2 * a * b / (a + b) : 0;
  });
  const i = Math.max(0, cues.findIndex((cue) => cue.time >= t) - 1);
  const a = cues[i], b = cues[i + 1], dt = b.time - a.time;
  const u = Math.min(1, Math.max(0, (t - a.time) / dt));
  return (2*u**3-3*u*u+1)*a.y+(u**3-2*u*u+u)*dt*tangents[i]+(-2*u**3+3*u*u)*b.y+(u**3-u*u)*dt*tangents[i+1];
}

export function ShowcaseController() {
  const [status, setStatus] = useState<"loading" | "running" | "done" | "stopped">("loading");
  const [run, setRun] = useState(0);
  const [message, setMessage] = useState("");
  const frame = useRef(0);
  const startTimer = useRef<number | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const objectUrl = useRef<string | null>(null);
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);
  const stop = useCallback(() => {
    if (startTimer.current) clearTimeout(startTimer.current);
    cancelAnimationFrame(frame.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    else stream.current?.getTracks().forEach(track => track.stop());
    setStatus("stopped");
  }, []);
  const begin = useCallback(() => {
    if (startTimer.current) clearTimeout(startTimer.current);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "instant" });
    ScrollTrigger.refresh();
    window.dispatchEvent(new CustomEvent("og-showcase-play"));
    setRun(value => value + 1);
    setStatus("running");
    if (recorder.current?.state === "inactive" && stream.current?.active) recorder.current.start(1000);
    const cues = timeline(), started = performance.now();
    cancelAnimationFrame(frame.current);
    const tick = (now: number) => {
      const seconds = Math.min(DURATION, (now - started) / 1000);
      window.scrollTo({ top: position(cues, seconds), behavior: "instant" });
      if (seconds < DURATION) frame.current = requestAnimationFrame(tick);
      else {
        if (recorder.current?.state === "recording") recorder.current.stop();
        setStatus("done");
      }
    };
    frame.current = requestAnimationFrame(tick);
  }, []);
  const play = useCallback(() => {
    if (startTimer.current) clearTimeout(startTimer.current);
    cancelAnimationFrame(frame.current);
    setStatus("loading");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new CustomEvent("og-showcase-play"));
    const requested = performance.now();
    const prepare = () => {
      const opening = document.querySelector<HTMLElement>('.cinema-media[data-priority="true"]');
      if (opening?.dataset.playing === "true") { begin(); return; }
      if (performance.now() - requested >= 15000 || opening?.dataset.mediaState === "unavailable") {
        stream.current?.getTracks().forEach(track => track.stop());
        recorder.current = null;
        setStatus("stopped");
        setMessage("The opening film hasn't loaded. Retry playback or explore the website while it connects.");
        return;
      }
      startTimer.current = window.setTimeout(prepare, 250);
    };
    prepare();
  }, [begin]);
  useEffect(() => {
    document.documentElement.classList.add("showcase-mode");
    // Start on real advancing footage, not an arbitrary timer or iframe onReady.
    play();
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") stop(); };
    const interrupt = () => stop();
    window.addEventListener("keydown", key);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    return () => {
      if (startTimer.current) clearTimeout(startTimer.current);
      cancelAnimationFrame(frame.current);
      document.documentElement.classList.remove("showcase-mode");
      window.removeEventListener("keydown", key); window.removeEventListener("wheel", interrupt); window.removeEventListener("touchstart", interrupt);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach(track => track.stop());
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, [play, stop]);

  async function record() {
    if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === "undefined") {
      setMessage("Recording is available in desktop Chrome or Edge. The showcase still plays here."); return;
    }
    stop();
    try {
      setMessage("Choose this OG tab in the sharing window. The 55-second recording starts automatically.");
      const options = { video: { frameRate: { ideal: 60 }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false, preferCurrentTab: true, selfBrowserSurface: "include" } as DisplayMediaStreamOptions;
      const capture = await navigator.mediaDevices.getDisplayMedia(options);
      stream.current = capture;
      const mime = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8"].find(type => MediaRecorder.isTypeSupported(type));
      const recording = new MediaRecorder(capture, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 16000000 });
      recorder.current = recording;
      const chunks: BlobPart[] = [];
      recording.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recording.onstop = () => {
        const type = recording.mimeType;
        capture.getTracks().forEach(track => track.stop());
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        const url = URL.createObjectURL(new Blob(chunks, { type }));
        objectUrl.current = url;
        setDownload({ url, name: `OG-55-Second-Showcase.${type.includes("mp4") ? "mp4" : "webm"}` });
      };
      capture.getVideoTracks()[0].addEventListener("ended", stop, { once: true });
      play();
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === "NotAllowedError" ? "Recording cancelled. You can replay the showcase whenever you like." : "This browser could not start recording. You can still replay the showcase.");
    }
  }

  return <>
    {status === "running" && <div key={run} className="showcase-intro" aria-hidden="true"><span className="wordmark"><img src="/media/og-title-original.png" alt="" /></span></div>}
    <div className={`showcase-controls ${status === "running" ? "is-running" : ""}`} role="region" aria-label="55-second showcase controls" data-duration={DURATION}>
      {status === "loading" ? <><span>PREPARING THE FILMS…</span><button onClick={record}>RECORD 55-SECOND VIDEO</button></> : status === "running" ? <button onClick={stop}>STOP SHOWCASE</button> : <>
        <button onClick={play}>REPLAY 55 SECONDS</button>
        <button onClick={record}>RECORD 55-SECOND VIDEO</button>
        {download && <a href={download.url} download={download.name}>DOWNLOAD VIDEO</a>}
        <a href="/">EXPLORE THE WEBSITE</a>
      </>}
      {message && <p role="status">{message}</p>}
    </div>
  </>;
}
