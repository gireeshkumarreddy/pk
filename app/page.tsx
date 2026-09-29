"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CinemaMedia } from "@/components/cinema-media";
import { ShowcaseController } from "@/components/showcase-controller";

const films = [
  { title: "Hungry Cheetah", subtitle: "THE FIRST GLIMPSE", id: "7Y5q41D8_hs", image: "OG011.webp", text: "A silence. A silhouette. A name that needs no introduction." },
  { title: "Firestorm", subtitle: "THE SOUND OF OG", id: "FbXOsVByKmk", image: "og-dual-guns.jpg", text: "The calm ends here. Music by Thaman S." },
  { title: "They Call Him OG", subtitle: "THE OFFICIAL TRAILER", id: "_8J8LwoVH_0", image: "og-truck.jpg", text: "Pawan Kalyan. Emraan Hashmi. A film by Sujeeth." },
];
const orbitImages = ["og-dual-guns.jpg", "OG007.webp", "OG015.webp", "OG009.png", "OG002.jpg", "og-truck.jpg", "OG008.webp", "OG011.webp", "OG013.webp", "OG016.jpg"];
const tiles = orbitImages.map((image, i) => {
  const angle = i / orbitImages.length * Math.PI * 2 - Math.PI / 2;
  return [50 + Math.cos(angle) * 43, 50 + Math.sin(angle) * 43, i % 3 === 0 ? 18 : 14, image] as const;
});

function Wordmark({ className = "" }: { className?: string }) { return <span className={`wordmark ${className}`} role="img" aria-label="OG — official movie title"><img src="/media/og-title-original.png" alt="" width="2375" height="1619" draggable={false} /></span>; }

export default function Home() {
  const main = useRef<HTMLElement>(null);
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [origin, setOrigin] = useState("");
  const [showcase, setShowcase] = useState(false);
  useEffect(() => { setOrigin(window.location.origin); setShowcase(new URLSearchParams(window.location.search).get("showcase") === "1"); }, []);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 700;
    const introTimer = window.setTimeout(() => setIntroDone(true), reduced ? 0 : 2600);
    const context = gsap.context(() => {
      if (reduced) return;
      const intro = gsap.timeline();
      intro.fromTo(".intro-mark", { y: 28, opacity: 0, clipPath: "inset(100% 0 0 0)" }, { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "power3.out" }, 0.1)
        .to(".intro-line", { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 0.35)
        .to(".intro-mark", { scale: 0.2, y: () => -window.innerHeight * 0.5 + 43, duration: 0.9, ease: "power3.inOut" }, 1.2)
        .to(".intro", { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "power3.inOut" }, 1.65);
      gsap.set(".mosaic-tile", { scale: 2.1, x: (_, element) => (Number(element.dataset.x) - 50) * 10, y: (_, element) => (Number(element.dataset.y) - 50) * 8, opacity: 0 });
      gsap.set([".center-mark", ".manifesto", ".storm-line", ".portrait-scene"], { autoAlpha: 0 });
      gsap.set(".red-field", { clipPath: "circle(0% at 50% 50%)" });
      gsap.set(".red-crescent", { autoAlpha: 0, scale: 0.6, rotation: -70 });
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: ".journey", start: "top top", end: "bottom bottom", scrub: 0.55, invalidateOnRefresh: true } });
      tl.to(".hero-copy, .hero-footer", { opacity: 0, y: -35, duration: 0.55 }, 0.15)
        .to(".opening-panel", { clipPath: "circle(44vmin at 50% 50%)", scale: mobile ? 0.61 : 0.47, x: 0, y: 0, duration: 1.5 }, 0.35)
        .to(".opening-panel", { scale: 0.1, autoAlpha: 0, rotation: -28, duration: 0.8 }, 1.7)
        .to(".opening-panel .image-shade", { opacity: 0, duration: 0.9 }, 0.7)
        .to(".mosaic-tile", { scale: 1, x: 0, y: 0, opacity: 1, stagger: 0.025, duration: 1.55 }, 0.55)
        .to(".center-mark", { autoAlpha: 1, scale: 1, duration: 0.7 }, 1.9)
        .to(".mosaic", { rotation: -210, rotationX: 10, duration: 2.3, ease: "none" }, 1.3)
        .to(".mosaic-tile", { rotationY: (i) => i % 2 === 0 ? 22 : -22, rotationZ: (i) => i % 2 === 0 ? 14 : -14, duration: 2.3, ease: "none" }, 1.3)
        .to(".center-mark .wordmark", { rotation: -360, duration: 1.9, ease: "power2.inOut" }, 1.9)
        .to(".red-crescent", { autoAlpha: 1, scale: 1, duration: 0.5 }, 1.8)
        .to(".red-crescent", { rotation: 360, scale: 1.6, duration: 1.8, ease: "power2.inOut" }, 2.0)
        .to(".red-crescent", { autoAlpha: 0, duration: 0.5 }, 3.1)
        .to(".red-field", { clipPath: "circle(150% at 50% 50%)", duration: 1.0, ease: "power2.inOut" }, 2.65)
        .to(".center-mark", { opacity: 0.12, scale: 1.2, duration: 0.7 }, 3.1)
        .fromTo(".manifesto", { y: 35 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 2.75)
        .to(".mosaic-tile", { scale: 0.65, duration: 1.2, stagger: 0.015 }, 2.6)
        
        .to(".mosaic-tile", { y: (_, el) => (Number(el.dataset.y) > 50 ? 1 : -1) * window.innerHeight * 0.8, opacity: 0, duration: 1.05, stagger: 0.025 }, 3.65)
        
        .to(".manifesto", { autoAlpha: 0, y: -20, duration: 0.5 }, 4.0)
        .to(".storm-line", { autoAlpha: 1, duration: 0.5 }, 4.25)
        .to(".storm-line, .center-mark", { autoAlpha: 0, duration: 0.5 }, 4.85)
        .to(".red-field", { clipPath: "circle(0% at 50% 25%)", duration: 1 }, 5.1)
        .fromTo(".portrait-scene", { y: "55vh" }, { y: 0, autoAlpha: 1, duration: 1 }, 5.1)
        .fromTo(".frame-outline", { y: -70 }, { y: -24, duration: 1 }, 5.8)
        .to(".portrait-mask", { yPercent: -101, duration: 0.85 }, 6.65)
        .fromTo(".portrait-words span", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.22, duration: 0.65 }, 7.0)
        .to(".portrait-first", { opacity: 0, duration: 0.55 }, 8.0)
        .to(".portrait-words", { y: -20, duration: 0.8 }, 8.0)
        .to({}, { duration: 0.35 }, 8.65);
      const header = document.querySelector<HTMLElement>(".site-header");
      const journey = document.querySelector<HTMLElement>(".journey");
      const wide = document.querySelector<HTMLElement>(".wide-scene");
      const ending = document.querySelector<HTMLElement>(".end-card");
      const updateHeader = () => {
        if (!header || !journey || !wide || !ending) return;
        const y = window.scrollY;
        const phase = y / Math.max(1, journey.offsetHeight - window.innerHeight) * 9;
        let dark = (phase >= 1.0 && phase < 2.6) || phase >= 5.7;
        if (y >= wide.offsetTop - 75) dark = false;
        if (y >= ending.offsetTop - 75) dark = true;
        header.style.color = dark ? "#11100f" : "#eeeae4";
        header.dataset.tone = dark ? "dark" : "light";
      };
      ScrollTrigger.create({ trigger: main.current, start: "top top", end: "bottom bottom", onUpdate: updateHeader, onRefresh: updateHeader });
      updateHeader();
      gsap.fromTo(".wide-media", { clipPath: "inset(35% 0 0 0)", scale: 0.94 }, { clipPath: "inset(0% 0 0 0)", scale: 1, ease: "none", scrollTrigger: { trigger: ".wide-scene", start: "top bottom", end: "top top", scrub: 0.5 } });
      gsap.fromTo(".wide-copy", { y: 60, opacity: 0 }, { y: 0, opacity: 1, scrollTrigger: { trigger: ".wide-scene", start: "top 45%", end: "top top", scrub: 0.5 } });
      gsap.fromTo(".wide-media", { y: 0 }, { y: 80, ease: "none", scrollTrigger: { trigger: ".wide-scene", start: "top top", end: "bottom top", scrub: true } });
      const world = gsap.timeline({ scrollTrigger: { trigger: ".world", start: "top top", end: "bottom bottom", scrub: 0.65 } });
      world.to(".world-copy", { opacity: 0, y: -70, duration: 0.5 }, 0.5)
        .to(".world-tile", { left: "50%", top: (_, el) => `${22 + Number(el.dataset.index) * 12}%`, width: mobile ? "68%" : "40%", xPercent: -50, rotation: 0, rotationY: 0, duration: 1.5, stagger: 0.08, ease: "power2.inOut" }, 0.15)
        .to(".world-tile", { y: 90, opacity: 0, duration: 0.65, stagger: 0.05 }, 1.7);
      gsap.utils.toArray<HTMLElement>(".film-chapter").forEach((section) => {
        gsap.fromTo(section.querySelector(".film-image"), { scale: 0.88, y: 50 }, { scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: section, start: "top 90%", end: "top 25%", scrub: 0.6 } });
        gsap.fromTo(section.querySelector(".chapter-title"), { y: 65 }, { y: -30, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });
      gsap.fromTo(".end-car-card", { clipPath: "inset(18% 8% 18% 8%)", y: 75 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, ease: "none", scrollTrigger: { trigger: ".end-car-card", start: "top 95%", end: "top 35%", scrub: 0.6 } });
      gsap.fromTo(".end-mark", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".end-card", start: "top 65%" } });
      gsap.to(".progress-line", { scaleX: 1, ease: "none", scrollTrigger: { trigger: main.current, start: "top top", end: "bottom bottom", scrub: true } });
    }, main);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => { clearTimeout(introTimer); context.revert(); window.removeEventListener("load", onLoad); };
  }, []);
  function navigate(id: string) { setMenu(false); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 120); }
  function openFilm(index: number) { setPlayerError(false); setSelected(index); }
  return <main ref={main}>
    {showcase && <ShowcaseController />}
    <a className="skip-link" href="#films">Skip to films</a>
    {!introDone && <div className="intro" aria-hidden="true"><Wordmark className="intro-mark" /><div className="intro-line" /><span>THEY CALL HIM</span></div>}
    <header className="site-header">
      <button className="header-film" onClick={() => navigate("home")}>A SUJEETH FILM</button>
      <button className="header-logo" aria-label="Back to opening" onClick={() => navigate("home")}><Wordmark /></button>
      <button className="menu-toggle" onClick={() => setMenu(true)} aria-label="Open chapter navigation">INDEX <span><i /><i /></span></button>
    </header>
    <section className="journey" id="home" aria-label="The return of OG">
      <div className="journey-stage">
        <div className="red-field" /><div className="red-crescent" aria-hidden="true" />
        <div className="mosaic" aria-hidden="true">{tiles.map(([x, y, w, img], i) => <div key={i} data-x={x} data-y={y} className={`mosaic-tile tile-${i}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%` } as CSSProperties}><img src={`/media/${img}`} alt="" width="2048" height="1152" loading={i < 5 ? "eager" : "lazy"} /></div>)}</div>
        <div className="center-mark" aria-hidden="true"><Wordmark /></div>
        <div className="opening-panel">
          <CinemaMedia image="OG011.webp" id="7Y5q41D8_hs" start={42} end={64} priority label="Pawan Kalyan — OG action entrance" paused={paused || selected !== null} />
          <div className="image-shade" />
          <div className="hero-copy"><p className="eyebrow">PAWAN KALYAN</p><h1>Some names<br />become <em>legends.</em></h1><div className="hero-title"><span>THEY CALL HIM</span><Wordmark /></div></div>
          <div className="hero-footer"><span>SCROLL TO ENTER HIS WORLD</span><span className="scroll-indicator" aria-hidden="true" /><button onClick={() => openFilm(2)} className="text-link">WATCH THE TRAILER <span className="play-icon" /></button></div>
        </div>
        <div className="manifesto"><span className="eyebrow">THE RETURN OF OJAS GAMBHEERA</span><h2>A name buried in silence.<br />A storm that never died.</h2></div>
        <div className="storm-line"><h2>The storm returns.</h2><span className="eyebrow">THEY CALL HIM OG</span></div>
        <div className="portrait-scene">
          <span className="side-note note-left">THE MAN BEHIND THE NAME</span><span className="side-note note-right">OJAS<br />GAMBHEERA</span>
          <div className="portrait-frame"><div className="frame-outline" /><div className="portrait-inner"><img src="/media/og-dual-guns.jpg" alt="Ojas Gambheera in a red action scene" /><img className="portrait-first" src="/media/og-portrait.jpg" alt="Pawan Kalyan in the world of OG" /><div className="portrait-mask"><p>Some storms<br />never leave.<br />They wait.</p><span>01 — THE RETURN</span></div></div></div>
          <h2 className="portrait-words"><span>The man.</span><span>The myth.</span><span>The storm.</span></h2>
        </div>
      </div>
    </section>
    <section className="wide-scene" id="story" aria-label="The world of OG"><div className="wide-media"><CinemaMedia image="og-dual-guns.jpg" id="7Y5q41D8_hs" start={59} end={78} label="The Hungry Cheetah — official OG glimpse" paused={paused || selected !== null} /><div className="wide-shade" /></div><div className="wide-copy"><p className="eyebrow">SILENCE HAS AN EXPIRY DATE.</p><h2>And then,<br />there was <em>OG.</em></h2><p>A world of shadows.<br />A name that echoes through it.</p></div><div className="wide-bottom"><span>POWER STAR PAWAN KALYAN</span><span>THEY CALL HIM OG</span></div></section>
    <section className="world" id="world" aria-label="The world in fragments"><div className="world-stage"><div className="world-copy"><p className="eyebrow">A WORLD IN FRAGMENTS</p><h2>Quiet menace.<br />Unmistakable power.<br /><em>One original.</em></h2><span>THE FILMS, THE SOUND, THE RETURN.</span></div><div className="world-constellation" aria-hidden="true">{["OG007.webp", "OG008.webp", "OG011.webp", "og-dual-guns.jpg", "OG009.png"].map((img, i) => <div className={`world-tile world-tile-${i}`} key={i} data-index={i}><img src={`/media/${img}`} alt="" loading="lazy" /></div>)}</div></div></section>
    <section className="films" id="films" aria-label="The OG films"><div className="film-section-label"><span>THE OG ARCHIVE</span><span>THREE WAYS INTO HIS WORLD</span></div>{films.map((film, i) => <article className="film-chapter" key={film.id}><div className="chapter-topline"><span>0{i + 1}</span><span>{film.subtitle}</span><span>DVV ENTERTAINMENT</span></div><h2 className="chapter-title">{film.title}</h2><button className="film-image" onClick={() => openFilm(i)} aria-label={`Play ${film.title}`}><CinemaMedia image={film.image} id={film.id} label={film.title} paused={paused || selected !== null} /><span className="chapter-play"><span className="play-icon" />PLAY FILM</span></button><div className="chapter-caption"><p>{film.text}</p><button onClick={() => openFilm(i)} className="text-link">WATCH <span className="play-icon" /></button></div></article>)}</section>
    <footer className="end-card" id="end"><p className="eyebrow">PAWAN KALYAN IN</p><div className="end-mark"><span>THEY CALL HIM</span><Wordmark /></div><div className="end-car-card"><CinemaMedia image="og-dual-guns.jpg" id="FbXOsVByKmk" start={52} end={84} aperture={16 / 9} className="footer-title-media" label="Firestorm — official animated lyric film" paused={paused || selected !== null} /><div className="car-title"><span>THEY CALL HIM</span><Wordmark /></div></div><div className="end-actions"><button onClick={() => openFilm(2)}>WATCH THE TRAILER <span className="play-icon" /></button><button onClick={() => navigate("home")}>BACK TO THE BEGINNING</button></div><div className="credits"><span>A FILM BY SUJEETH</span><span>MUSIC BY THAMAN S</span><span>DVV ENTERTAINMENT</span></div><div className="legal"><span>AN INDEPENDENT FAN EXPERIENCE</span><span>FILM & MUSIC BELONG TO THEIR RESPECTIVE OWNERS.</span><a href="https://www.youtube.com/watch?v=_8J8LwoVH_0" target="_blank" rel="noreferrer">OFFICIAL TRAILER</a></div></footer>
    <div className="playback-control">{!showcase && <a href="?showcase=1">55-SECOND SHOWCASE</a>}<button onClick={() => setPaused(!paused)} aria-label={paused ? "Resume background films" : "Pause background films"}>{paused ? "PLAY MOTION" : "PAUSE FILMS"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button></div><div className="progress-line" aria-hidden="true" />
    <Sheet open={menu} onOpenChange={setMenu}><SheetContent className="chapter-menu"><SheetTitle className="menu-heading">THE OG INDEX</SheetTitle><SheetDescription className="menu-description">Enter at any chapter.</SheetDescription><nav>{[["home", "The return"], ["story", "His world"], ["films", "The films"], ["end", "OG"]].map(([id, label], i) => <button key={id} onClick={() => navigate(id)}><span>0{i + 1}</span>{label}</button>)}</nav><Wordmark /><p>A SUJEETH FILM<br />PAWAN KALYAN AS OJAS GAMBHEERA</p></SheetContent></Sheet>
    <Dialog open={selected !== null} onOpenChange={(v) => { if (!v) setSelected(null); }}><DialogContent className="film-dialog"><DialogTitle>{selected !== null ? films[selected].title : "OG"}</DialogTitle><DialogDescription>Official promotional film. Sound and playback controls are available in the player.</DialogDescription>{selected !== null && <><iframe title={films[selected].title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={() => setPlayerError(true)} src={`https://www.youtube.com/embed/${films[selected].id}?autoplay=1&rel=0&playsinline=1&origin=${encodeURIComponent(origin)}`} /><a className="player-fallback" target="_blank" rel="noreferrer" href={`https://www.youtube.com/watch?v=${films[selected].id}`}>{playerError ? "Player unavailable — watch on YouTube" : "Open official film on YouTube"}</a></>}</DialogContent></Dialog>
  </main>;
}
