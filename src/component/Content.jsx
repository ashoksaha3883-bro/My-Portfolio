
import React, { useState, useEffect, useRef } from "react";
import myLeptop from '../images/image3.png'
import quize from '../images/quize.png'
import warrenty from '../images/warrenty.png'
import  QR from '../images/Qr.png'

const THEME = {
  bg: "#04050d",
  card: "rgba(16, 22, 48, 0.85)",
  cardSolid: "#070a1a",
  line: "rgba(150, 180, 255, 0.18)",
  blue: "#4f8cff",
  cyan: "#38d6ff",
  violet: "#8b6bff",
  muted: "#d3ddf5",
};

const projects = [
  {
    id: 1,
    title: "QuizCraft",
    tagline: "AI-Powered Quiz Generation Platform",
    category: "Full-Stack Web Application",
    type: "Education",
    year: "2026",
    description:
      "An AI-style quiz builder where learners pick a topic, question type and difficulty, then practise instantly. Includes progress tracking, question jump navigation and a saved quizzes library.",
    image: quize,
    link: "https://quize-project-kohl.vercel.app/",
    accent: "#6fa0ff",
    features: [
      "Multiple choice, True / False and Short answer modes",
      "Custom topic, difficulty and question count",
      "Live progress bar with tap-to-jump navigation",
      "Save, preview and revisit quizzes",
    ],
    techStack: [
      "Next.js",
       "Expressjs",
        "REST APIs",
         "MongoDB",
         "Google Gemini API"
    ],
  },
  {
    id: 2,
    title: "Warranty Vault",
    tagline: "Tracking & Document Management.",
    category: "Full-Stack Warranty Management Application",
    type: "Utility",
    year: "2026",
    description:
      "A mobile-first app to scan, store and track product warranties in one safe place. Upload a photo, image or PDF of any receipt and never lose a warranty claim again.",
    image: warrenty,
    link: "https://warranty-vault-ivory.vercel.app/",
    accent: "#b79cff",
    features: [
      "Smart Scan for photos, images and PDFs",
      "Products and Documents organised in tabs",
      "Floating action button and bottom navigation",
      "Clean, app-like responsive layout",
    ],
    techStack: [
      "React",
      "Tailwind CSS",
     "Express.js",
      "MongoDB",
      "Multer",
      "JWT Authentication, bcryptjs",
      "OCR.Space API"
    ],
  },
  {
    id: 3,
    title: "Smart QR Studio",
    tagline: "Create QR codes in seconds.",
    category: "Front End / Generator Tool",
    type: "Utility",
    year: "2026",
    description:
      "A QR code generator that supports text, websites, phone numbers, email and Wi-Fi. The preview updates live as you type, with colour, size and margin controls plus one-click copy and PNG download.",
    image: QR,
    link: "https://smart-qr-studio.vercel.app/studio",
    accent: "#38d6ff",
    features: [
      "5 QR types: Text, Website, Phone, Email, Wi-Fi",
      "Live preview while you edit",
      "Custom colour, background, size and margin",
      "Copy to clipboard and Download as PNG",
    ],
    techStack: [
      "Next.js",
      "Tailwind CSS",
      "qrcode npm package",
       "Browser APIs",
    ],
  },
];

const filters = [
  "All",
  ...Array.from(new Set(projects.map((p) => p.type))),
];

const marqueeItems = [
  "React",
  "Next.js",
  "Vite",
  "Tailwind CSS",
  "JavaScript ES6+",
  "React Router",
  "Context API",
  "Responsive Design",
  "Vercel",
  "Netlify",
];

const Galaxy = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;

    if (!ctx || !parent) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let raf;
    let stars = [];
    let shooters = [];

    const resize = () => {
      w = canvas.width = parent.clientWidth;
      h = canvas.height = parent.clientHeight;

      const count = Math.min(420, Math.floor((w * h) / 5500));

      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.2,
        a: Math.random(),
        s: Math.random() * 0.02 + 0.004,
        d: Math.random() > 0.5 ? 1 : -1,
        c: ["#ffffff", "#a9c8ff", "#c9b8ff", "#ffffff"][
          Math.floor(Math.random() * 4)
        ],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      stars.forEach((s) => {
        s.a += s.s * s.d;

        if (s.a >= 1 || s.a <= 0.1) {
          s.d *= -1;
        }

        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.a));
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reduce && Math.random() < 0.006 && shooters.length < 2) {
        shooters.push({
          x: Math.random() * w * 0.8,
          y: Math.random() * h * 0.4,
          vx: 9 + Math.random() * 5,
          vy: 4 + Math.random() * 3,
          life: 1,
        });
      }

      shooters = shooters.filter((m) => m.life > 0);

      shooters.forEach((m) => {
        const grad = ctx.createLinearGradient(
          m.x,
          m.y,
          m.x - m.vx * 8,
          m.y - m.vy * 8
        );

        grad.addColorStop(0, `rgba(220,235,255,${m.life})`);
        grad.addColorStop(1, "rgba(220,235,255,0)");

        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8);
        ctx.stroke();

        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.02;
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 40% at 78% 12%, rgba(54,92,200,0.30), transparent 70%)," +
            "radial-gradient(45% 35% at 15% 45%, rgba(110,70,220,0.20), transparent 70%)," +
            "radial-gradient(40% 30% at 85% 75%, rgba(30,160,220,0.14), transparent 70%)," +
            "radial-gradient(45% 30% at 20% 95%, rgba(110,70,220,0.18), transparent 70%)," +
            `linear-gradient(180deg, ${THEME.bg} 0%, #060a1c 50%, ${THEME.bg} 100%)`,
        }}
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
      />

      <div
        className="qc-float pointer-events-none absolute -left-24 top-[22%] h-64 w-64 rounded-full opacity-50 blur-[2px]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #6fa0ff, #1e2a6b 55%, transparent 70%)",
        }}
      />

      <div
        className="qc-float-slow pointer-events-none absolute -right-20 top-[58%] h-56 w-56 rounded-full opacity-40 blur-[2px]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #8fe6ff, #155e75 55%, transparent 70%)",
        }}
      />
    </>
  );
};

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold }
    );

    io.observe(el);

    return () => io.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const Reveal = ({
  children,
  className = "",
  from = "up",
  delay = 0,
}) => {
  const [ref, visible] = useInView();

  const hidden =
    from === "left"
      ? "opacity-0 -translate-x-12"
      : from === "right"
        ? "opacity-0 translate-x-12"
        : "opacity-0 translate-y-10";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-x-0 translate-y-0"
          : hidden
      } ${className}`}
    >
      {children}
    </div>
  );
};

const CountUp = ({ to, suffix = "" }) => {
  const [ref, visible] = useInView();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!visible) return;

    let cur = 0;
    const step = Math.max(1, Math.ceil(to / 40));

    const t = setInterval(() => {
      cur += step;

      if (cur >= to) {
        cur = to;
        clearInterval(t);
      }

      setN(cur);
    }, 30);

    return () => clearInterval(t);
  }, [visible, to]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
};

const Tilt = ({ children, className = "", onClick }) => {
  const ref = useRef(null);

  const move = (e) => {
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;

    el.style.transform = `perspective(1000px) rotateY(${
      x * 10
    }deg) rotateX(${-y * 8}deg) scale(1.04)`;
  };

  const leave = () => {
    if (ref.current) {
      ref.current.style.transform =
        "perspective(1000px) rotateY(0) rotateX(0) scale(1)";
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      onClick={onClick}
      className={`transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
};

const Screen = ({ project, className }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center text-center font-bold text-white ${className}`}
        style={{
          background: `linear-gradient(135deg, ${project.accent}55, #0a0f2a)`,
        }}
      >
        <span className="px-2 text-sm">{project.title}</span>
      </div>
    );
  }

  return (
    <img
      src={project.image}
      alt={project.title}
      className= {className}
      onError={() => setFailed(true)}
    />
  );
};

const Content = () => {
  const [clickedId, setClickedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const list =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.type === activeFilter);

  return (
    <section
      id="projects"
      className="relative isolate overflow-hidden px-4 py-10 text-white md:px-12 lg:px-32 xl:px-40"
      style={{
        background: THEME.bg,
        fontFamily:
          "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap');

        #projects h2, #projects h3 {
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: -0.02em;
        }

        #projects .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes qc-shimmer {
          to { background-position: -220% center; }
        }

        @keyframes qc-float {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-24px) }
        }

        @keyframes qc-marquee {
          to { transform: translateX(-50%); }
        }

        @keyframes qc-ping {
          0% { transform: scale(1); opacity: .7 }
          100% { transform: scale(1.9); opacity: 0 }
        }

        @keyframes qc-spin {
          to { transform: rotate(360deg); }
        }

        .qc-shimmer {
          background-size: 220% auto;
          animation: qc-shimmer 7s linear infinite;
        }

        .qc-float {
          animation: qc-float 8s ease-in-out infinite;
        }

        .qc-float-slow {
          animation: qc-float 12s ease-in-out infinite;
        }

        .qc-marquee {
          animation: qc-marquee 30s linear infinite;
        }

        .qc-ping {
          animation: qc-ping 2s ease-out infinite;
        }

        .qc-spin {
          animation: qc-spin 18s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .qc-shimmer,
          .qc-float,
          .qc-float-slow,
          .qc-marquee,
          .qc-ping,
          .qc-spin {
            animation: none;
          }
        }
      `}</style>

      <Galaxy />

      {/* HEADER */}
      <Reveal className="relative z-10 flex flex-col items-center text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(150,180,255,0.18)] bg-white/10 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.3em] text-[#e3ebff] backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#3dffa0]" />
          Portfolio
        </span>

        <h2
          className="qc-shimmer bg-clip-text text-5xl font-bold text-transparent md:text-6xl"
          style={{
            backgroundImage:
              "linear-gradient(100deg,#ffffff 0%,#9ec5ff 28%,#6fa0ff 48%,#b79cff 72%,#ffffff 100%)",
          }}
        >
          Latest Works
        </h2>

        <div className="mt-4 h-1 w-40 rounded-full bg-gradient-to-r from-[#38d6ff] via-[#4f8cff] to-[#8b6bff]" />

        {/* <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#d3ddf5]">
          Real, deployed products built with React and Tailwind CSS. Each one is
          designed to be fast, responsive and genuinely useful.
        </p> */}
      </Reveal>

    


      {/* FILTERS */}
      <div className="relative z-10 mt-14 flex flex-wrap justify-center gap-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setActiveFilter(f);
              setClickedId(null);
            }}
            className={`rounded-full border px-6 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
              activeFilter === f
                ? "border-transparent bg-gradient-to-br from-[#4f8cff] to-[#7a5cff] text-white shadow-[0_12px_40px_-12px_rgba(79,140,255,0.85)]"
                : "border-[rgba(150,180,255,0.18)] bg-white/10 text-[#e3ebff] backdrop-blur hover:border-[rgba(190,210,255,0.5)] hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* PROJECT TIMELINE */}
      <div className="relative z-10 pt-24">
        <div className="absolute bottom-0 left-1/2 -top-4 hidden w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#4f8cff]/60 to-transparent md:block" />

        <div className="flex flex-col gap-32 md:gap-44">
          {list.map((p, i) => {
            const even = i % 2 === 0;
            const clicked = clickedId === p.id;

            return (
              <div
                key={p.id}
                className={`relative flex flex-col items-center gap-14 md:flex-row md:gap-24 ${
                  even ? "" : "md:flex-row-reverse"
                }`}
              >
                {/* TIMELINE NODE */}
                <div className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                  <span
                    className="qc-ping absolute inset-0 rounded-full"
                    style={{ background: p.accent }}
                  />

                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 bg-[#04050d] font-mono text-sm font-bold"
                    style={{
                      borderColor: p.accent,
                      color: p.accent,
                      boxShadow: `0 0 22px ${p.accent}88`,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* PROJECT IMAGE */}
                <Reveal
                  from={even ? "left" : "right"}
                  className="relative z-10 w-full md:w-1/2"
                >
                  {clicked && (
                    <div className="absolute -top-24 left-1/2 z-30 flex -translate-x-1/2 animate-bounce flex-col items-center">
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whitespace-nowrap rounded-xl px-6 py-2 font-bold text-[#04050d] transition-all duration-300 hover:bg-white"
                        style={{
                          background: p.accent,
                          boxShadow: `0 0 20px ${p.accent}99`,
                        }}
                      >
                        Visit Website 🚀
                      </a>

                      <div
                        className="h-12 w-[2px]"
                        style={{
                          background: `linear-gradient(${p.accent}, transparent)`,
                        }}
                      />
                    </div>
                  )}

                  <Tilt
                    onClick={() => setClickedId(clicked ? null : p.id)}
                    className="group relative cursor-pointer"
                  >
                    <div
                      className="absolute inset-4 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                      style={{ background: p.accent }}
                    />

                    <div className="relative flex items-center justify-center">
                      <Screen
                        project={p}
                        className="block aspect-video w-full max-w-[560px] rounded-xl border border-[rgba(150,180,255,0.25)] object-cover shadow-2xl lg:hidden"
                      />

                      <img
  src={myLeptop}
  alt="Laptop frame"
  className="pointer-events-none relative z-10 hidden w-[400px] shadow-2xl lg:block xl:w-[600px]"
/>

<Screen
  project={p}
  className="absolute left-1/2 top-[17.5%] z-20 hidden h-[60%] w-[62%] -translate-x-1/2 object-fill lg:block"
/>
                    </div>

                    {!clicked && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span
                          className="rounded-full px-5 py-2 text-sm font-bold text-[#04050d] shadow-xl"
                          style={{ background: p.accent }}
                        >
                          Click to reveal link
                        </span>
                      </div>
                    )}
                  </Tilt>
                </Reveal>

                {/* PROJECT DETAILS */}
                <Reveal
                  from={even ? "right" : "left"}
                  delay={150}
                  className="z-10 w-full md:w-1/2"
                >
                  <div
                    className="rounded-3xl p-[1.5px] transition-all duration-500 hover:shadow-[0_0_45px_var(--a)]"
                    style={{
                      "--a": `${p.accent}55`,
                      background: `linear-gradient(135deg, ${p.accent}, transparent 40%, ${p.accent}77)`,
                    }}
                  >
                    <div className="flex flex-col items-center rounded-3xl bg-[#0c1230] p-7 text-center md:items-start md:p-8 md:text-left">
                      <div className="mb-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                        <span className="flex items-center gap-2 rounded-full border border-[rgba(150,180,255,0.18)] bg-white/10 px-3 py-1 font-mono text-xs font-medium text-[#e3ebff]">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-[#3dffa0]" />
                          Live
                        </span>

                        <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-medium text-slate-100">
                          {p.year}
                        </span>

                        <span
                          className="rounded-full px-3 py-1 text-xs font-bold"
                          style={{
                            background: `${p.accent}25`,
                            color: p.accent,
                          }}
                        >
                          {p.type}
                        </span>
                      </div>

                      <h3 className="text-3xl font-bold text-white md:text-4xl">
                        {p.title}
                      </h3>

                      <p
                        className="mt-1 text-base font-semibold italic"
                        style={{ color: p.accent }}
                      >
                        {p.tagline}
                      </p>

                      <span className="mt-2 font-mono text-xs font-medium uppercase tracking-widest text-[#d3ddf5]">
                        ({p.category})
                      </span>

                      <p className="mt-5 text-base leading-relaxed text-[#d3ddf5]">
                        {p.description}
                      </p>

                      <ul className="mt-6 w-full space-y-2.5 text-left text-[15px] text-[#f2f6ff]">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <span
                              className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold text-[#04050d]"
                              style={{ background: p.accent }}
                            >
                              ✓
                            </span>

                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
                        {p.techStack.map((t) => (
                          <span
                            key={t}
                            className="cursor-default rounded-full border px-3 py-1 font-mono text-xs font-medium text-white transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                              borderColor: `${p.accent}77`,
                              background: `${p.accent}1a`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = p.accent;
                              e.currentTarget.style.color = "#04050d";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `${p.accent}1a`;
                              e.currentTarget.style.color = "#fff";
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-[14px] bg-gradient-to-br from-[#4f8cff] to-[#7a5cff] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(79,140,255,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-10px_rgba(110,120,255,0.95)]"
                      >
                        View Live Project

                        <span className="transition-transform duration-300 group-hover/btn:translate-x-1.5">
                          →
                        </span>
                      </a>
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>

      {/* TECHNOLOGY MARQUEE */}
      {/* <Reveal className="relative z-10 mt-36">
        <p className="mb-5 text-center font-mono text-xs font-medium uppercase tracking-[0.35em] text-[#d3ddf5]">
          Tools I build with
        </p>

        <div className="overflow-hidden rounded-2xl border border-[rgba(150,180,255,0.18)] bg-[rgba(16,22,48,0.85)] py-4 backdrop-blur">
          <div className="qc-marquee flex w-max gap-4">
            {[...marqueeItems, ...marqueeItems].map((m, idx) => (
              <span
                key={idx}
                className="whitespace-nowrap rounded-full border border-[rgba(150,180,255,0.25)] bg-white/10 px-5 py-2 font-mono text-sm font-medium text-[#f2f6ff]"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* CONTACT SECTION */}
      {/* <Reveal className="relative z-10 mt-32 text-center">
        <div className="relative mx-auto max-w-3xl rounded-3xl border border-[rgba(150,180,255,0.18)] bg-[rgba(16,22,48,0.85)] px-6 py-12 backdrop-blur">
          <div className="qc-spin pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full border-2 border-dashed border-[#4f8cff]/50" /> */}

          {/* <h3 className="text-3xl font-bold text-white md:text-4xl">
            Have a project in mind?
          </h3>

          <p className="mx-auto mt-4 max-w-lg text-lg text-[#d3ddf5]">
            I'm open to freelance work and collaborations. Let's build something
            out of this world together.
          </p> */}

          {/* <a
            href="#contact"
            className="mt-8 inline-block rounded-[14px] bg-gradient-to-br from-[#4f8cff] to-[#7a5cff] px-9 py-3.5 font-semibold text-white shadow-[0_12px_40px_-12px_rgba(79,140,255,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-10px_rgba(110,120,255,0.95)]"
          >
            Let's Talk 🚀
          </a>
        </div> */}
      {/* </Reveal> */} 
    </section>
  );
};

export default Content;
