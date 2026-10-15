"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Props = {
  className?: string;
  brand?: string;
  kicker?: string;
  headlineLead?: string;
  headlineEmphasis?: string;
  subheadline?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  quietNote?: string;
  playingNote?: string;
  startedNote?: string;
  pills?: readonly string[];
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

const SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF =
  '"Iowan Old Style", "Palatino Linotype", Palatino, "Times New Roman", Times, serif';

const DEFAULT_PILLS = ["Never repeats", "Breath-tuned", "Quiet rooms"] as const;

function noop() {}

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  phase: number;
  spark: boolean;
  cool: boolean;
};

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createStars(count: number, seed: number): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const hue = rand();
    return {
      x: rand(),
      y: rand(),
      r: rand() * 1.15 + 0.25,
      a: rand() * 0.5 + 0.25,
      tw: rand() * 0.7 + 0.25,
      phase: rand() * Math.PI * 2,
      spark: hue > 0.92,
      cool: hue > 0.78 && hue <= 0.92,
    };
  });
}

const STARS = createStars(130, 21);

function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const media =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let reduce = media?.matches ?? false;
    let frame = 0;
    let alive = true;

    const paint = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.floor(width * dpr);
      const nextH = Math.floor(height * dpr);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (const star of STARS) {
        const twinkle = reduce
          ? 1
          : 0.62 + 0.38 * Math.sin(time * 0.00055 * star.tw + star.phase);
        const x = star.x * width;
        const y = star.y * height;
        const alpha = Math.max(0, Math.min(1, star.a * twinkle));
        const fill = star.cool
          ? `rgba(198, 214, 255, ${alpha})`
          : `rgba(255, 246, 232, ${alpha})`;

        if (star.spark) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, star.r * 12);
          glow.addColorStop(0, `rgba(255, 244, 220, ${0.32 * twinkle})`);
          glow.addColorStop(1, "rgba(255, 244, 220, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, star.r * 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 248, 236, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x - star.r * 4.2, y);
          ctx.lineTo(x + star.r * 4.2, y);
          ctx.moveTo(x, y - star.r * 4.2);
          ctx.lineTo(x, y + star.r * 4.2);
          ctx.stroke();
        }

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (time: number) => {
      if (!alive) return;
      paint(time);
      if (!reduce) frame = window.requestAnimationFrame(loop);
    };

    frame = window.requestAnimationFrame(loop);

    const onChange = () => {
      reduce = media?.matches ?? false;
      if (!reduce) {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(loop);
      }
    };
    media?.addEventListener("change", onChange);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => paint(performance.now()))
        : null;
    observer?.observe(canvas);

    return () => {
      alive = false;
      window.cancelAnimationFrame(frame);
      media?.removeEventListener("change", onChange);
      observer?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 block h-full w-full"
      aria-hidden="true"
    />
  );
}

function MoonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M20 14.6A8.1 8.1 0 0 1 9.5 4.1 6.8 6.8 0 1 0 20 14.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8.4 5.5c0-.8.9-1.3 1.6-.9l8.8 5.8c.6.4.6 1.3 0 1.7l-8.8 5.8c-.7.5-1.6 0-1.6-.9V5.5Z" />
    </svg>
  );
}

function MiniBars() {
  return (
    <span className="flex h-3.5 w-3.5 items-end justify-between" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="nocturne-bar inline-block w-[2px] rounded-full bg-current"
          style={{
            height: "14px",
            transformOrigin: "bottom",
            animation: `nocturne-bar 1.15s ease-in-out ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function Waveform() {
  return (
    <span className="flex h-7 items-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          className="nocturne-bar inline-block w-[2px] rounded-full bg-[#d9fff4]"
          style={{
            height: `${8 + ((i * 17) % 16)}px`,
            transformOrigin: "center",
            animation: `nocturne-bar 1.8s ease-in-out ${(i % 7) * 0.1}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function NightMoon({ gradId, maskId }: { gradId: string; maskId: string }) {
  return (
    <svg viewBox="0 0 200 200" className="relative h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="36%" cy="34%" r="68%">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="40%" stopColor="#f1e4c8" />
          <stop offset="76%" stopColor="#c9c3dc" />
          <stop offset="100%" stopColor="#8d95b4" />
        </radialGradient>
        <mask id={maskId}>
          <rect width="200" height="200" fill="black" />
          <circle cx="94" cy="100" r="58" fill="white" />
          <circle cx="122" cy="80" r="48" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <circle cx="94" cy="100" r="58" fill={`url(#${gradId})`} />
        <circle cx="76" cy="90" r="8" fill="#ddd4c0" opacity="0.45" />
        <circle cx="100" cy="118" r="5" fill="#d5ccb8" opacity="0.4" />
        <circle cx="84" cy="124" r="3.5" fill="#e8dfcd" opacity="0.45" />
        <circle cx="92" cy="78" r="2.5" fill="#efe6d4" opacity="0.35" />
      </g>
    </svg>
  );
}

const CSS = `
.nocturne-root, .nocturne-root * { box-sizing: border-box; }
.nocturne-root { max-width: 100%; overflow-wrap: break-word; }
@keyframes nocturne-rise {
  from { opacity: 0; transform: translate3d(0, 22px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes nocturne-scene-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes nocturne-drift-a {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(7%, 5%, 0) scale(1.08); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes nocturne-drift-b {
  0% { transform: translate3d(0, 0, 0) scale(1.04); }
  50% { transform: translate3d(-8%, 4%, 0) scale(1); }
  100% { transform: translate3d(0, 0, 0) scale(1.04); }
}
@keyframes nocturne-drift-c {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(5%, -7%, 0) scale(1.06); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes nocturne-glow {
  0%, 100% { opacity: 0.38; }
  50% { opacity: 0.82; }
}
@keyframes nocturne-breathe {
  0%, 100% { transform: scale(0.92); opacity: 0.5; }
  40% { transform: scale(1.06); opacity: 0.88; }
  70% { transform: scale(0.98); opacity: 0.58; }
}
@keyframes nocturne-bar {
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
}
.nocturne-reveal {
  animation: nocturne-rise 1.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  .nocturne-anim,
  .nocturne-bar {
    animation: none !important;
  }
  .nocturne-reveal {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

export function NocturneHero({
  className = "",
  brand = "Nocturne",
  kicker = "Tonight, and no night like it",
  headlineLead = "Fall asleep to",
  headlineEmphasis = "something beautiful",
  subheadline = "Generative soundscapes that never repeat, tuned to how you breathe.",
  primaryLabel = "Try it free",
  secondaryLabel = "Listen to a sample",
  quietNote = "No two nights sound the same.",
  playingNote = "A sample of rain on glass, slowing with a long exhale.",
  startedNote = "A place is held for you. Begin when the night is ready.",
  pills = DEFAULT_PILLS,
  onPrimaryClick = noop,
  onSecondaryClick = noop,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const moonGrad = `nocturne-moon-${uid}`;
  const moonMask = `nocturne-mask-${uid}`;
  const noiseId = `nocturne-noise-${uid}`;
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  return (
    <section
      id="nocturne-hero"
      aria-labelledby="nocturne-heading"
      data-listening={playing ? "true" : "false"}
      className={cn(
        "nocturne-root relative isolate flex min-h-screen w-full flex-col overflow-x-hidden bg-[#06060b] text-[#f6f1e8] antialiased",
        className,
      )}
      style={{ fontFamily: SANS, colorScheme: "dark" }}
    >
      <style>{CSS}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="nocturne-anim absolute inset-0"
          style={{ animation: "nocturne-scene-in 3.2s ease both" }}
        >
          <div
            className="nocturne-anim absolute -left-[20%] top-[-14%] h-[58%] w-[74%] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(96, 82, 196, 0.34), transparent 68%)",
              animation: "nocturne-drift-a 42s ease-in-out infinite",
            }}
          />
          <div
            className="nocturne-anim absolute -right-[12%] top-[6%] h-[46%] w-[58%] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(48, 156, 144, 0.26), transparent 70%)",
              animation: "nocturne-drift-b 54s ease-in-out infinite",
            }}
          />
          <div
            className="nocturne-anim absolute bottom-[-8%] left-[10%] h-[42%] w-[64%] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(232, 196, 168, 0.12), transparent 68%)",
              animation: "nocturne-drift-c 48s ease-in-out infinite",
            }}
          />

          <div className="absolute left-1/2 top-[-22%] h-[78%] w-[58%] max-w-[720px] -translate-x-1/2">
            <div
              className="nocturne-anim h-full w-full opacity-70 blur-3xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(214, 210, 255, 0.18), rgba(150, 176, 196, 0.05) 48%, transparent 78%)",
                animation: "nocturne-glow 22s ease-in-out infinite",
              }}
            />
          </div>

          <div className="absolute right-[8%] top-[-16%] h-[88%] w-24 origin-top rotate-[18deg] sm:w-36">
            <div
              className="nocturne-anim h-full w-full opacity-60 blur-2xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(236, 230, 255, 0.3), rgba(186, 198, 255, 0.06) 42%, transparent 74%)",
                animation: "nocturne-glow 16s ease-in-out infinite",
              }}
            />
          </div>
          <div className="absolute right-[20%] top-[-12%] h-[76%] w-16 origin-top rotate-[34deg] sm:w-24">
            <div
              className="nocturne-anim h-full w-full opacity-50 blur-2xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(226, 236, 255, 0.22), transparent 70%)",
                animation: "nocturne-glow 21s ease-in-out 1.4s infinite",
              }}
            />
          </div>
          <div className="absolute right-[1%] top-[-8%] h-[64%] w-32 origin-top rotate-[6deg] sm:w-48">
            <div
              className="nocturne-anim h-full w-full opacity-40 blur-3xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 244, 230, 0.16), transparent 68%)",
                animation: "nocturne-glow 26s ease-in-out 0.6s infinite",
              }}
            />
          </div>

          <Starfield />

          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
            <div
              className="nocturne-anim rounded-full blur-2xl"
              style={{
                width: "min(92vw, 820px)",
                height: "min(86vw, 680px)",
                background:
                  "radial-gradient(ellipse at center, rgba(154, 146, 255, 0.16), rgba(64, 150, 142, 0.05) 46%, transparent 72%)",
                animation: "nocturne-breathe 10s ease-in-out infinite",
              }}
            />
          </div>

          <div className="absolute right-[4%] top-[5%] h-32 w-32 sm:h-44 sm:w-44 md:h-52 md:w-52 lg:right-[8%] lg:h-64 lg:w-64">
            <div
              className="nocturne-anim absolute -inset-12 rounded-full opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(236, 228, 255, 0.55), rgba(120, 140, 200, 0.08) 46%, transparent 70%)",
                animation: "nocturne-glow 12s ease-in-out infinite",
              }}
            />
            <div
              className="nocturne-anim absolute -inset-3 rounded-full border opacity-40"
              style={{
                borderColor: "rgba(255,255,255,0.14)",
                animation: "nocturne-breathe 10s ease-in-out infinite",
              }}
            />
            <div
              className="nocturne-anim absolute -inset-8 rounded-full border opacity-25"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                animation: "nocturne-breathe 10s ease-in-out 1.1s infinite",
              }}
            />
            <NightMoon gradId={moonGrad} maskId={moonMask} />
          </div>

          <div
            className="absolute bottom-[11%] left-1/2 h-px -translate-x-1/2"
            style={{
              width: "min(70%, 760px)",
              background:
                "linear-gradient(90deg, transparent, rgba(244,236,220,0.55), transparent)",
            }}
          />
          <div
            className="absolute bottom-[5%] left-1/2 h-28 -translate-x-1/2 blur-2xl"
            style={{
              width: "min(84%, 920px)",
              background:
                "radial-gradient(ellipse at top, rgba(176, 188, 255, 0.18), transparent 70%)",
            }}
          />
        </div>

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 34%, rgba(6,6,11,0.78) 100%)",
          }}
        />
        <svg className="absolute inset-0 h-full w-full opacity-[0.045]" aria-hidden="true">
          <filter id={noiseId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="1"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full min-w-0 max-w-[1500px] flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-14">
        <header
          className="nocturne-reveal flex items-center justify-between gap-4"
          style={{ animationDelay: "0.08s" }}
        >
          <div className="flex min-w-0 items-center gap-2.5 text-[#f3ead8]">
            <MoonMark className="h-4 w-4 shrink-0" />
            <span
              className="max-w-[12rem] truncate text-[12px] uppercase tracking-[0.32em] sm:max-w-none sm:text-[13px]"
              style={{ fontFamily: SERIF }}
            >
              {brand}
            </span>
          </div>
          <span className="hidden shrink-0 text-[11px] uppercase tracking-[0.28em] text-[rgba(214,208,228,0.62)] sm:block">
            After midnight
          </span>
        </header>

        <div className="relative flex w-full min-w-0 flex-1 flex-col items-center justify-center py-14 text-center sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-full max-w-[860px] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(6,6,11,0.5), transparent 70%)",
            }}
          />

          <p
            className="nocturne-reveal relative mb-6 flex max-w-full items-center justify-center gap-2.5 text-sm text-[#ddd6ea]"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span
                className="nocturne-anim absolute inset-0 rounded-full bg-[#c8fff0] opacity-70"
                style={{ animation: "nocturne-glow 7.5s ease-in-out infinite" }}
              />
              <span className="relative h-2 w-2 rounded-full bg-[#f4fffb]" />
            </span>
            <span className="text-balance">{kicker}</span>
          </p>

          <h1
            id="nocturne-heading"
            aria-label={`${headlineLead} ${headlineEmphasis}`}
            className="relative w-full max-w-full font-normal tracking-[-0.035em] text-[#f7f2ea]"
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(2.45rem, 6.6vw, 8rem)",
              lineHeight: 0.96,
            }}
          >
            <span
              className="nocturne-reveal block text-balance"
              style={{
                animationDelay: "0.52s",
                textShadow: "0 10px 40px rgba(5,5,12,0.8)",
              }}
            >
              {headlineLead}
            </span>
            <span
              className="nocturne-reveal mt-1 block text-balance pb-2 italic text-[#e6e0ff]"
              style={{
                animationDelay: "0.76s",
                textShadow: "0 10px 36px rgba(5,5,12,0.75)",
              }}
            >
              {headlineEmphasis}
            </span>
          </h1>

          <p
            className="nocturne-reveal relative mt-8 max-w-[38rem] text-balance text-[15px] leading-relaxed text-[#cfc9dc] sm:text-lg"
            style={{ animationDelay: "1.02s" }}
          >
            {subheadline}
          </p>

          <div className="relative mt-9 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <button
              id="nocturne-try-free"
              type="button"
              onClick={() => {
                setStarted(true);
                onPrimaryClick();
              }}
              className="nocturne-reveal inline-flex min-h-12 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full bg-[#f4efe6] px-6 text-[15px] tracking-wide text-[#17151c] transition-colors duration-500 hover:bg-[#fffaf3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e4dcc8] sm:min-w-[148px]"
              style={{
                animationDelay: "1.24s",
                fontWeight: 500,
                boxShadow: started
                  ? "0 12px 40px rgba(0,0,0,0.28), 0 0 0 1px rgba(240,226,196,0.8)"
                  : "0 12px 40px rgba(0,0,0,0.28)",
              }}
            >
              <MoonMark className="h-4 w-4" />
              {primaryLabel}
            </button>
            <button
              id="nocturne-listen-sample"
              type="button"
              aria-pressed={playing}
              onClick={() => {
                setPlaying((value) => !value);
                onSecondaryClick();
              }}
              className="nocturne-reveal inline-flex min-h-12 cursor-pointer touch-manipulation items-center justify-center gap-2.5 rounded-full border bg-[rgba(255,255,255,0.05)] px-6 text-[15px] tracking-wide text-[#f6f1e8] backdrop-blur-md transition-colors duration-500 hover:bg-[rgba(255,255,255,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e4dcc8] sm:min-w-[210px]"
              style={{
                animationDelay: "1.4s",
                fontWeight: 500,
                backgroundColor: playing ? "rgba(255,255,255,0.1)" : undefined,
                borderColor: playing ? "rgba(210,255,236,0.45)" : "rgba(255,255,255,0.16)",
                boxShadow: playing ? "0 0 40px rgba(180,255,230,0.12)" : "none",
              }}
            >
              {playing ? <MiniBars /> : <PlayMark className="h-3.5 w-3.5" />}
              {secondaryLabel}
            </button>
          </div>

          <div
            className="nocturne-reveal relative mt-8 flex min-h-10 w-full max-w-lg items-center justify-center px-2"
            style={{ animationDelay: "1.58s" }}
          >
            {playing ? (
              <p
                id="nocturne-status"
                role="status"
                aria-live="polite"
                className="flex flex-col items-center gap-3 text-sm leading-relaxed text-[#ddd7ea] sm:flex-row"
              >
                <Waveform />
                <span>{playingNote}</span>
              </p>
            ) : started ? (
              <p
                id="nocturne-status"
                role="status"
                aria-live="polite"
                className="text-sm leading-relaxed text-[#ddd7ea]"
              >
                {startedNote}
              </p>
            ) : (
              <p className="text-sm text-[rgba(196,190,210,0.78)]">{quietNote}</p>
            )}
          </div>

          <ul
            className="nocturne-reveal relative mt-8 flex max-w-full list-none flex-wrap items-center justify-center gap-1.5 p-0 sm:gap-2"
            style={{ animationDelay: "1.76s" }}
          >
            {pills.map((pill, index) => (
              <li
                key={`${pill}-${index}`}
                className="rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#d4cedf] sm:text-[11px]"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                }}
              >
                {pill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default NocturneHero;
