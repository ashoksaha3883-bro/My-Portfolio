
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* =========================================================
   1. EDIT YOUR DETAILS HERE
   ========================================================= */
const PROFILE = {
  name: "Ashok Kumar",
  initials: "AK",
 roles: [
  "complete web applications",
  "responsive, polished interfaces",
  "secure, scalable APIs",
  "ideas into working products",
],
  intro:
  "A full-stack fresher who builds complete web apps end to end, from clean, responsive interfaces to APIs and databases. I learn fast, write clean code, and I’m ready to bring that energy to a team that ships.",
stats: [
  { value: "Front to Back", label: "End-to-end ownership" },
  { value: "Real Projects", label: "Built, not just studied" },
  { value: "Day 1", label: "Ready to contribute" },
],
  links: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "mailto:you@example.com",
  },
  cv: "/cv.pdf",
};



const CHIPS = [
  { label: "React", color: "#38d6ff", top: "22%", right: "8%", delay: "0s" },
  { label: "Three.js", color: "#b79cff", top: "62%", right: "4%", delay: "1.1s" },
  { label: "Next.js", color: "#ffffff", top: "80%", right: "27%", delay: "2.2s" },
  { label: "Node.js", color: "#7dffb2", top: "13%", right: "31%", delay: "0.6s" },
];

/* =========================================================
   2. 3D HELPERS
   ========================================================= */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Soft round glow (used for stars, particles and light halos)
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.22, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.12)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Procedural planet surfaces (no image files needed)
function makePlanetTexture(kind, colors, seed) {
  const rand = mulberry32(seed);
  const w = 512;
  const h = 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");

  if (kind === "rock") {
    g.fillStyle = colors[0];
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) {
      g.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
      g.fillRect(rand() * w, rand() * h, 2 + rand() * 3, 2 + rand() * 3);
    }
    for (let i = 0; i < 70; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = 3 + rand() * 15;
      g.fillStyle = "rgba(0,0,0,0.25)";
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.16)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x - 1, y - 1, r, 0, Math.PI * 2);
      g.stroke();
    }
  } else {
    const grad = g.createLinearGradient(0, 0, 0, h);
    colors.forEach((col, i) => grad.addColorStop(i / (colors.length - 1), col));
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 110; i++) {
      g.globalAlpha = 0.12 + rand() * 0.28;
      g.fillStyle = colors[Math.floor(rand() * colors.length)];
      g.fillRect(0, rand() * h, w, 2 + rand() * 14);
    }
    g.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      g.fillStyle = "rgba(255,255,255,0.6)";
      g.beginPath();
      g.ellipse(rand() * w, rand() * h, 14 + rand() * 30, 4 + rand() * 8, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }
  return new THREE.CanvasTexture(c);
}

function makeRingTexture(rgb, seed) {
  const rand = mulberry32(seed);
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 8;
  const g = c.getContext("2d");
  for (let x = 0; x < 512; x++) {
    const band = 0.3 + 0.7 * Math.abs(Math.sin(x * 0.09) * Math.sin(x * 0.023 + 1));
    const gap = x > 230 && x < 262 ? 0.06 : 1;
    const a = Math.min(1, band * gap * (0.45 + rand() * 0.4));
    g.fillStyle = "rgba(" + rgb + "," + a + ")";
    g.fillRect(x, 0, 1, 8);
  }
  const tex = new THREE.CanvasTexture(c);
  if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const PLANET_VERT = `
  varying vec3 vN;
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const PLANET_FRAG = `
  uniform sampler2D map;
  uniform vec3 lightPos;
  uniform vec3 rimColor;
  varying vec3 vN;
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    vec3 N = normalize(vN);
    vec3 L = normalize(lightPos - vW);
    vec3 V = normalize(cameraPosition - vW);
    float d = dot(N, L);
    float lit = 0.10 + 0.95 * smoothstep(-0.05, 0.85, d);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 rim = pow(rimColor, vec3(0.4545));
    vec3 col = texture2D(map, vUv).rgb * lit + rim * fres * (0.25 + 0.9 * max(d, 0.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

const ATMO_VERT = `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = `
  uniform vec3 glowColor;
  varying vec3 vN;
  void main() {
    float i = pow(max(0.72 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
    vec3 c = pow(glowColor, vec3(0.4545));
    gl_FragColor = vec4(c * i * 1.6, i);
  }
`;

const PLANETS = [
  {
    kind: "rock", colors: ["#9a8f86", "#6e655e"], rim: "#9ec5ff", seed: 11,
    radius: 0.26, orbit: 4.9, speed: 0.32, tilt: 0.3, tiltZ: 0.12, phase: 0.6, spin: 0.5,
  },
  {
    kind: "gas", colors: ["#f0d9b5", "#c98f5a", "#f6e8cf", "#b0703f", "#e8c9a0"], rim: "#ffd9a8", seed: 23,
    radius: 0.6, orbit: 5.7, speed: 0.2, tilt: 0.38, tiltZ: -0.22, phase: 2.4, spin: 0.35,
    ring: { rgb: "236,212,170", inner: 0.95, outer: 1.7 },
  },
  {
    kind: "gas", colors: ["#8fe6ff", "#3b8dff", "#b8f3ff", "#2f6fe0"], rim: "#8fe0ff", seed: 37,
    radius: 0.42, orbit: 6.4, speed: 0.15, tilt: 0.26, tiltZ: 0.3, phase: 4.1, spin: 0.4,
    moon: { radius: 0.1, distance: 0.85, speed: 1.3 },
  },
  {
    kind: "gas", colors: ["#c5b0ff", "#6d4bd6", "#e1d6ff", "#4b2fa8"], rim: "#c9b8ff", seed: 53,
    radius: 0.36, orbit: 7.1, speed: -0.11, tilt: 0.45, tiltZ: -0.1, phase: 5.3, spin: 0.3,
  },
];

/* =========================================================
   3. COMPONENT
   ========================================================= */
export default function Home() {
  const mountRef = useRef(null);
  const [typed, setTyped] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  /* ---------- typewriter role text ---------- */
  useEffect(() => {
    let word = 0;
    let letters = 0;
    let deleting = false;
    let timer;

    const tick = () => {
      const text = PROFILE.roles[word];
      if (!deleting) {
        letters++;
        setTyped(text.slice(0, letters));
        if (letters === text.length) {
          deleting = true;
          timer = setTimeout(tick, 1700);
          return;
        }
        timer = setTimeout(tick, 70);
      } else {
        letters--;
        setTyped(text.slice(0, letters));
        if (letters === 0) {
          deleting = false;
          word = (word + 1) % PROFILE.roles.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 35);
      }
    };

    timer = setTimeout(tick, 1400);
    return () => clearTimeout(timer);
  }, []);

  /* ---------- 3D scene ---------- */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 700;
    const disposables = [];
    const track = (o) => {
      disposables.push(o);
      return o;
    };

    const scene = new THREE.Scene();
    const CAM_Z = 13;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
    camera.position.set(0, 0, CAM_Z + 5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const glowTex = track(makeGlowTexture());
    const lightPos = new THREE.Vector3();
    const lightUniform = { value: lightPos };

    const galaxy = new THREE.Group();
    scene.add(galaxy);

    function makeGlowSprite(color, scale, opacity) {
      const mat = track(
        new THREE.SpriteMaterial({
          map: glowTex,
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(scale, scale, 1);
      return sprite;
    }

    /* --- core glow --- */
    const coreGlow = makeGlowSprite(0x3f78ff, 15, 0.34);
    const coreHot = makeGlowSprite(0x9fd0ff, 6, 0.3);
    galaxy.add(coreGlow, coreHot);

    /* --- particle globe + mesh lines (your original, polished) --- */
    const globe = new THREE.Group();
    galaxy.add(globe);

    const positions = [];
    const colors = [];
    const blue = new THREE.Color("#6fa6ff");
    const white = new THREE.Color("#e5f3ff");
    const particleCount = isMobile ? 4500 : 8500;

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * 2 - 1;
      const angle = Math.random() * Math.PI * 2;
      const r = 3.1 + (Math.random() - 0.5) * 0.22;
      const spread = Math.sqrt(1 - u * u);
      positions.push(r * spread * Math.cos(angle), r * u, r * spread * Math.sin(angle));
      const col = blue.clone().lerp(white, Math.random());
      colors.push(col.r, col.g, col.b);
    }

    const sphereGeometry = track(new THREE.BufferGeometry());
    sphereGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    sphereGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const sphereMaterial = track(
      new THREE.PointsMaterial({
        size: 0.06,
        map: glowTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    globe.add(new THREE.Points(sphereGeometry, sphereMaterial));

    const lineMaterial = track(
      new THREE.LineBasicMaterial({
        color: 0x83b7ff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const radius = 3.08;

    function addCurve(points, material, parent) {
      const geometry = track(new THREE.BufferGeometry().setFromPoints(points));
      const line = new THREE.Line(geometry, material);
      parent.add(line);
      return line;
    }

    for (let lat = -1.25; lat <= 1.25; lat += 0.19) {
      const pts = [];
      const y = Math.sin(lat) * radius;
      const ringRadius = Math.cos(lat) * radius;
      for (let j = 0; j <= 160; j++) {
        const a = (j / 160) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * ringRadius, y, Math.sin(a) * ringRadius));
      }
      addCurve(pts, lineMaterial, globe);
    }

    for (let lon = 0; lon < Math.PI; lon += 0.19) {
      const pts = [];
      for (let j = 0; j <= 120; j++) {
        const lat = (j / 120) * Math.PI - Math.PI / 2;
        pts.push(
          new THREE.Vector3(
            radius * Math.cos(lat) * Math.cos(lon),
            radius * Math.sin(lat),
            radius * Math.cos(lat) * Math.sin(lon)
          )
        );
      }
      addCurve(pts, lineMaterial, globe);
    }

    /* --- spiral galaxy disc around the globe --- */
    const discTilt = new THREE.Group();
    discTilt.rotation.set(0.42, 0, -0.25);
    galaxy.add(discTilt);
    const discSpin = new THREE.Group();
    discTilt.add(discSpin);

    const discCount = isMobile ? 5000 : 11000;
    const discPos = [];
    const discCol = [];
    const stops = [
      new THREE.Color("#7fe8ff"),
      new THREE.Color("#4f8cff"),
      new THREE.Color("#8b6bff"),
      new THREE.Color("#ff7ad9"),
    ];
    const tmp = new THREE.Color();

    for (let i = 0; i < discCount; i++) {
      const t = Math.pow(Math.random(), 0.65);
      const rad = 3.8 + t * 3.2;
      const arm = (i % 3) * ((Math.PI * 2) / 3);
      const a = arm + rad * 0.85 + (Math.random() - 0.5) * 0.7;
      const g1 = Math.random() + Math.random() + Math.random() - 1.5;
      const g2 = Math.random() + Math.random() + Math.random() - 1.5;
      discPos.push(
        Math.cos(a) * rad + g1 * 0.28,
        g2 * 0.14,
        Math.sin(a) * rad + g2 * 0.28
      );
      const f = t * (stops.length - 1);
      const idx = Math.min(Math.floor(f), stops.length - 2);
      tmp.copy(stops[idx]).lerp(stops[idx + 1], f - idx);
      discCol.push(tmp.r, tmp.g, tmp.b);
    }

    const discGeometry = track(new THREE.BufferGeometry());
    discGeometry.setAttribute("position", new THREE.Float32BufferAttribute(discPos, 3));
    discGeometry.setAttribute("color", new THREE.Float32BufferAttribute(discCol, 3));
    const discMaterial = track(
      new THREE.PointsMaterial({
        size: 0.045,
        map: glowTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    discSpin.add(new THREE.Points(discGeometry, discMaterial));

    /* --- glowing light rings (your original orbits) --- */
    const orbitGroup = new THREE.Group();
    galaxy.add(orbitGroup);
    const orbitLights = [];
    const orbitLightGeometry = track(new THREE.SphereGeometry(1, 16, 16));

    const orbitData = [
      { radius: 3.55, speed: 0.18, size: 0.075, color: 0x9dccff, tilt: -0.28 },
      { radius: 3.85, speed: -0.13, size: 0.065, color: 0x4c91ff, tilt: 0.22 },
      { radius: 4.15, speed: 0.15, size: 0.07, color: 0xd7eaff, tilt: 0.42 },
    ];

    const orbitPoint = (o, a) =>
      new THREE.Vector3(
        Math.cos(a) * o.radius,
        Math.sin(a) * o.radius * 0.32,
        Math.sin(a) * o.radius * 0.24
      );

    orbitData.forEach((orbit, index) => {
      const pathGroup = new THREE.Group();
      pathGroup.rotation.x = orbit.tilt;
      pathGroup.rotation.y = index * 0.18;
      orbitGroup.add(pathGroup);

      const pts = [];
      for (let j = 0; j < 240; j++) pts.push(orbitPoint(orbit, (j / 240) * Math.PI * 2));
      const curve = new THREE.CatmullRomCurve3(pts, true);

      const haloMat = track(
        new THREE.MeshBasicMaterial({
          color: orbit.color,
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      pathGroup.add(new THREE.Mesh(track(new THREE.TubeGeometry(curve, 300, 0.04, 8, true)), haloMat));

      const ringMat = track(
        new THREE.MeshBasicMaterial({
          color: orbit.color,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      pathGroup.add(new THREE.Mesh(track(new THREE.TubeGeometry(curve, 300, 0.01, 6, true)), ringMat));

      const light = new THREE.Mesh(
        orbitLightGeometry,
        track(new THREE.MeshBasicMaterial({ color: 0xffffff }))
      );
      light.scale.setScalar(orbit.size);
      pathGroup.add(light);

      const lightGlow = makeGlowSprite(orbit.color, 0.8, 0.95);
      pathGroup.add(lightGlow);

      const trailDots = [];
      for (let j = 0; j < 16; j++) {
        const fade = 1 - j / 16;
        const dot = new THREE.Mesh(
          orbitLightGeometry,
          track(
            new THREE.MeshBasicMaterial({
              color: orbit.color,
              transparent: true,
              opacity: fade * 0.8,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            })
          )
        );
        dot.scale.setScalar(Math.max(orbit.size * fade * 0.65, 0.008));
        pathGroup.add(dot);
        trailDots.push(dot);
      }

      orbitLights.push({ light, lightGlow, trailDots, orbit, offset: index * 2.1 });
    });

    /* --- planets --- */
    const guideMaterial = track(
      new THREE.LineBasicMaterial({
        color: 0x7fa8ff,
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );

    function planetMaterial(kind, cols, rim, seed) {
      const map = track(makePlanetTexture(kind, cols, seed));
      return track(
        new THREE.ShaderMaterial({
          uniforms: {
            map: { value: map },
            lightPos: lightUniform,
            rimColor: { value: new THREE.Color(rim) },
          },
          vertexShader: PLANET_VERT,
          fragmentShader: PLANET_FRAG,
        })
      );
    }

    function atmosphereMaterial(color) {
      return track(
        new THREE.ShaderMaterial({
          uniforms: { glowColor: { value: new THREE.Color(color) } },
          vertexShader: ATMO_VERT,
          fragmentShader: ATMO_FRAG,
          side: THREE.BackSide,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
    }

    const planets = PLANETS.map((p) => {
      const pivot = new THREE.Group();
      pivot.rotation.set(p.tilt, 0, p.tiltZ);
      galaxy.add(pivot);

      const guidePts = [];
      for (let j = 0; j < 200; j++) {
        const a = (j / 200) * Math.PI * 2;
        guidePts.push(new THREE.Vector3(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit));
      }
      pivot.add(new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints(guidePts)), guideMaterial));

      const holder = new THREE.Group();
      pivot.add(holder);
      const axis = new THREE.Group();
      axis.rotation.set(0.35, 0, 0.35);
      holder.add(axis);

      const geo = track(new THREE.SphereGeometry(p.radius, 48, 48));
      const mesh = new THREE.Mesh(geo, planetMaterial(p.kind, p.colors, p.rim, p.seed));
      axis.add(mesh);

      const atmo = new THREE.Mesh(geo, atmosphereMaterial(p.rim));
      atmo.scale.setScalar(1.22);
      axis.add(atmo);

      if (p.ring) {
        const rg = track(new THREE.RingGeometry(p.radius * p.ring.inner, p.radius * p.ring.outer, 96, 1));
        const pos = rg.attributes.position;
        const uv = rg.attributes.uv;
        const v = new THREE.Vector3();
        const inner = p.radius * p.ring.inner;
        const outer = p.radius * p.ring.outer;
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
        }
        const ring = new THREE.Mesh(
          rg,
          track(
            new THREE.MeshBasicMaterial({
              map: track(makeRingTexture(p.ring.rgb, p.seed)),
              transparent: true,
              side: THREE.DoubleSide,
              depthWrite: false,
            })
          )
        );
        ring.rotation.x = Math.PI / 2;
        axis.add(ring);
      }

      let moonPivot = null;
      if (p.moon) {
        moonPivot = new THREE.Group();
        holder.add(moonPivot);
        const moon = new THREE.Mesh(
          track(new THREE.SphereGeometry(p.moon.radius, 24, 24)),
          planetMaterial("rock", ["#b8b2ab", "#7d766f"], "#cfe3ff", p.seed + 5)
        );
        moon.position.set(p.moon.distance, 0, 0);
        moonPivot.add(moon);
      }

      return { p, holder, mesh, moonPivot };
    });

    /* --- background stars, dust, shooting stars (in world space) --- */
    function makeStars(count, minR, maxR, size, opacity) {
      const pos = [];
      const col = [];
      const palette = [new THREE.Color("#ffffff"), new THREE.Color("#a9c8ff"), new THREE.Color("#c9b8ff")];
      for (let i = 0; i < count; i++) {
        const u = Math.random() * 2 - 1;
        const a = Math.random() * Math.PI * 2;
        const r = minR + Math.random() * (maxR - minR);
        const s = Math.sqrt(1 - u * u);
        pos.push(r * s * Math.cos(a), r * u * 0.7, r * s * Math.sin(a) - 10);
        const c = palette[Math.floor(Math.random() * palette.length)];
        col.push(c.r, c.g, c.b);
      }
      const geo = track(new THREE.BufferGeometry());
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      const mat = track(
        new THREE.PointsMaterial({
          size,
          map: glowTex,
          vertexColors: true,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      return pts;
    }

    const starsA = makeStars(isMobile ? 900 : 2200, 25, 70, 0.14, 0.9);
    const starsB = makeStars(isMobile ? 120 : 320, 25, 70, 0.3, 0.8);

    const dustPositions = [];
    for (let i = 0; i < 900; i++) {
      dustPositions.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
    }
    const dustGeometry = track(new THREE.BufferGeometry());
    dustGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      track(
        new THREE.PointsMaterial({
          color: 0x9bbfff,
          size: 0.05,
          map: glowTex,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      )
    );
    scene.add(dust);

    const shooters = [0, 1, 2].map((i) => {
      const geo = track(new THREE.BufferGeometry());
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      geo.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0.85, 0.93, 1]), 3)
      );
      const mat = track(
        new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const line = new THREE.Line(geo, mat);
      line.visible = false;
      line.frustumCulled = false;
      scene.add(line);
      return {
        line, geo, mat,
        active: false,
        life: 0,
        next: 3 + i * 2 + Math.random() * 3,
        head: new THREE.Vector3(),
        vel: new THREE.Vector3(),
      };
    });

    /* --- layout / interaction --- */
    const base = { x: 2.8, y: 0.1, s: 0.9 };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    function layout() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
      const halfW = halfH * camera.aspect;

      if (camera.aspect > 1.15) {
        base.x = halfW * 0.4;
        base.y = 0.1;
        base.s = THREE.MathUtils.clamp((halfW - base.x) / 7.2, 0.5, 1);
      } else {
        base.x = 0;
        base.y = halfH * 0.36;
        base.s = Math.min(0.8, (halfW * 1.15) / 4.4);
      }
    }

    function onPointerMove(e) {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(container);
    window.addEventListener("pointermove", onPointerMove);

    let running = true;
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    });
    io.observe(container);

    /* --- animation loop --- */
    const clock = new THREE.Clock();
    let time = 0;
    let intro = 0;
    let frameId;

    function tick() {
      frameId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!running || document.hidden) return;

      time += dt;
      intro = Math.min(intro + dt / 2.8, 1);
      const e = 1 - Math.pow(1 - intro, 3);

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      // cinematic dolly-in + mouse parallax
      camera.position.set(mouse.x * 0.9, -mouse.y * 0.6, CAM_Z + (1 - e) * 5);
      camera.lookAt(0, 0, 0);

      galaxy.position.set(base.x, base.y + Math.sin(time * 0.6) * 0.08, 0);
      galaxy.scale.setScalar(base.s * (0.72 + 0.28 * e));
      galaxy.rotation.y = mouse.x * 0.3;
      galaxy.rotation.x = mouse.y * 0.18;

      globe.rotation.y = time * 0.055;
      globe.rotation.x = Math.sin(time * 0.15) * 0.08;
      discSpin.rotation.y = -time * 0.04;

      coreGlow.material.opacity = 0.32 + Math.sin(time * 1.4) * 0.05;
      coreHot.material.opacity = 0.28 + Math.sin(time * 2.1 + 1) * 0.05;

      galaxy.getWorldPosition(lightPos);

      planets.forEach(({ p, holder, mesh, moonPivot }) => {
        const a = p.phase + time * p.speed;
        holder.position.set(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit);
        mesh.rotation.y += dt * p.spin;
        if (moonPivot) moonPivot.rotation.y = time * p.moon.speed;
      });

      orbitLights.forEach(({ light, lightGlow, trailDots, orbit, offset }) => {
        const angle = time * orbit.speed + offset;
        light.position.copy(orbitPoint(orbit, angle));
        lightGlow.position.copy(light.position);
        const pulse = 1 + Math.sin(time * 2 + offset) * 0.12;
        lightGlow.scale.set(0.8 * pulse, 0.8 * pulse, 1);
        trailDots.forEach((dot, i) => {
          const trailAngle = angle - Math.sign(orbit.speed) * (i + 1) * 0.025;
          dot.position.copy(orbitPoint(orbit, trailAngle));
        });
      });

      starsA.rotation.y = time * 0.004;
      starsB.rotation.y = time * 0.004;
      starsB.material.opacity = 0.55 + Math.sin(time * 1.7) * 0.25;
      dust.rotation.y = time * 0.008;

      shooters.forEach((s) => {
        if (!s.active) {
          s.next -= dt;
          if (s.next <= 0) {
            s.head.set(-20 + Math.random() * 10, 6 + Math.random() * 4, -8 + Math.random() * 4);
            s.vel.set(22 + Math.random() * 8, -9 - Math.random() * 4, 0);
            s.life = 0.9;
            s.active = true;
            s.line.visible = true;
          }
          return;
        }
        s.life -= dt;
        s.head.addScaledVector(s.vel, dt);
        const arr = s.geo.attributes.position.array;
        arr[0] = s.head.x - s.vel.x * 0.1;
        arr[1] = s.head.y - s.vel.y * 0.1;
        arr[2] = s.head.z;
        arr[3] = s.head.x;
        arr[4] = s.head.y;
        arr[5] = s.head.z;
        s.geo.attributes.position.needsUpdate = true;
        s.mat.opacity = Math.max(0, Math.min(1, s.life / 0.9));
        if (s.life <= 0) {
          s.active = false;
          s.line.visible = false;
          s.next = 3 + Math.random() * 5;
        }
      });

      renderer.render(scene, camera);
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      ro.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <main id="home" className="hero">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="hero-bg" aria-hidden="true" />
      <div ref={mountRef} className="galaxy-background" aria-hidden="true" />
      <div className="hero-fade" aria-hidden="true" />

      {/* ---------- NAV ---------- */}
      <header className={"nav" + (menuOpen ? " open" : "")}>
        <a href="#home" className="logo">
          <span className="logo-mark">{PROFILE.initials}</span>
          <span className="logo-text">{PROFILE.name}</span>
        </a>

      

        

        <button
          className="burger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      {/* ---------- HERO TEXT ---------- */}
      <section className="hero-content">
        <div className="eyebrow rise" style={{ "--d": "0.3s" }}>
          <span className="pulse" />
          Full-Stack Developer · Ready to contribute from day one
        </div>

        <h1 className="rise" style={{ "--d": "0.45s" }}>
          <span className="hi">Hello, I&apos;m</span>
          <span className="name">{PROFILE.name}</span>
        </h1>

        <p className="role rise" style={{ "--d": "0.65s" }}>
          <span className="role-static">I craft </span>
          <span className="typed">{typed}</span>
          <span className="caret" />
        </p>

        <p className="intro rise" style={{ "--d": "0.85s" }}>
          {PROFILE.intro}
        </p>

        <div className="cta-row rise" style={{ "--d": "1.05s" }}>
          <a href="#projects" className="btn primary">
            View my work
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a href={PROFILE.cv} className="btn ghost" download>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
            </svg>
            Download CV
          </a>
        </div>

        <div className="meta-row rise" style={{ "--d": "1.25s" }}>
          

          <div className="stats">
            {PROFILE.stats.map((s) => (
              <div key={s.label} className="stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FLOATING TECH CHIPS ---------- */}
      {CHIPS.map((c) => (
        <div
          key={c.label}
          className="chip"
          style={{ top: c.top, right: c.right, "--delay": c.delay }}
        >
          <i style={{ background: c.color, boxShadow: "0 0 10px " + c.color }} />
          {c.label}
        </div>
      ))}

      {/* ---------- SCROLL HINT ---------- */}
      <a href="#about" className="scroll-hint" aria-label="Scroll down">
        <span className="mouse">
          <span className="wheel" />
        </span>
        <span className="scroll-text">Scroll</span>
      </a>
    </main>
  );
}

/* =========================================================
   4. STYLES (self-contained, nothing else to import)
   ========================================================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap');

.hero {
  --bg: #04050d;
  --text: #eef3ff;
  --muted: #9aa8c7;
  --blue: #4f8cff;
  --cyan: #38d6ff;
  --violet: #8b6bff;
  --line: rgba(150, 180, 255, 0.18);
  --pad: clamp(20px, 6vw, 96px);
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}
.hero *, .hero *::before, .hero *::after { box-sizing: border-box; }
.hero a { color: inherit; text-decoration: none; }

/* backgrounds */
.hero-bg {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(55% 50% at 74% 46%, rgba(54, 92, 200, 0.38), transparent 70%),
    radial-gradient(40% 40% at 18% 88%, rgba(110, 70, 220, 0.24), transparent 70%),
    radial-gradient(35% 35% at 92% 8%, rgba(30, 160, 220, 0.16), transparent 70%);
  animation: nebula 18s ease-in-out infinite alternate;
}
.galaxy-background {
  position: absolute;
  inset: 0;
  animation: fadeIn 2.2s ease 0.2s both;
}
.galaxy-background canvas { display: block; width: 100%; height: 100%; }
.hero-fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(4, 5, 13, 0.92) 0%, rgba(4, 5, 13, 0.62) 30%, rgba(4, 5, 13, 0) 60%),
    linear-gradient(0deg, rgba(4, 5, 13, 0.9), transparent 22%);
}

/* nav */
.nav {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px var(--pad);
  animation: dropIn 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) 0.1s both;
}
.logo { display: flex; align-items: center; gap: 12px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 18px; }
.logo-mark {
  display: grid; place-items: center;
  width: 40px; height: 40px;
  border-radius: 12px;
  font-size: 15px; font-weight: 700;
  background: linear-gradient(135deg, var(--blue), var(--violet));
  box-shadow: 0 8px 28px -8px rgba(79, 140, 255, 0.9);
}
.nav-links {
  display: flex; gap: 4px; padding: 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(10, 14, 30, 0.55);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}
.nav-links a {
  padding: 9px 18px; border-radius: 999px;
  font-size: 14px; font-weight: 500; color: var(--muted);
  transition: color 0.25s, background 0.25s;
}
.nav-links a:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
.nav-links a.active { color: #fff; background: rgba(79, 140, 255, 0.22); }
.nav-cta {
  padding: 11px 22px; border-radius: 999px;
  font-size: 14px; font-weight: 600;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.06);
  transition: all 0.3s;
}
.nav-cta:hover { background: #fff; color: #05060f; border-color: #fff; box-shadow: 0 0 30px rgba(255, 255, 255, 0.35); }
.burger { display: none; width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--line); background: rgba(255, 255, 255, 0.06); cursor: pointer; position: relative; }
.burger span { position: absolute; left: 12px; right: 12px; height: 2px; background: #fff; border-radius: 2px; transition: transform 0.3s, top 0.3s; }
.burger span:nth-child(1) { top: 16px; }
.burger span:nth-child(2) { top: 26px; }
.nav.open .burger span:nth-child(1) { top: 21px; transform: rotate(45deg); }
.nav.open .burger span:nth-child(2) { top: 21px; transform: rotate(-45deg); }

/* content */
.hero-content {
  position: relative; z-index: 5;
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  min-height: 100vh; min-height: 100svh;
  max-width: 820px;
  padding: 120px var(--pad) 100px;
}
.eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 8px 16px; border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.05);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  font-family: 'JetBrains Mono', monospace; font-size: 12.5px; letter-spacing: 0.04em; color: #c3d4ff;
}
.pulse { position: relative; width: 8px; height: 8px; border-radius: 50%; background: #3dffa0; }
.pulse::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: #3dffa0; animation: ping 2s ease-out infinite; }

.hero h1 { margin: 24px 0 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; line-height: 1.02; letter-spacing: -0.035em; }
.hero h1 .hi { display: block; margin-bottom: 8px; font-size: clamp(18px, 2.2vw, 28px); font-weight: 500; letter-spacing: 0; color: var(--muted); }
.hero h1 .name {
  display: block; font-size: clamp(42px, 7vw, 92px);
  background: linear-gradient(100deg, #ffffff 0%, #9ec5ff 28%, #6fa0ff 48%, #b79cff 72%, #ffffff 100%);
  background-size: 220% auto;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  animation: shine 7s linear infinite;
}
.role { margin: 20px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: clamp(20px, 2.6vw, 32px); font-weight: 500; min-height: 1.4em; }
.role-static { color: var(--muted); }
.typed { color: var(--cyan); text-shadow: 0 0 24px rgba(56, 214, 255, 0.45); }
.caret { display: inline-block; width: 2px; height: 1em; margin-left: 4px; vertical-align: -0.12em; background: var(--cyan); animation: blink 1s steps(1) infinite; }
.intro { max-width: 540px; margin: 22px 0 0; font-size: clamp(15px, 1.25vw, 17.5px); line-height: 1.75; color: var(--muted); }

.cta-row { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 34px; }
.btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 26px; border-radius: 14px;
  font-size: 15px; font-weight: 600;
  transition: transform 0.3s, box-shadow 0.3s, background 0.3s, border-color 0.3s;
}
.btn svg { transition: transform 0.3s; }
.btn.primary {
  color: #fff;
  background: linear-gradient(135deg, #4f8cff, #7a5cff);
  box-shadow: 0 12px 40px -12px rgba(79, 140, 255, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
.btn.primary:hover { transform: translateY(-3px); box-shadow: 0 18px 50px -10px rgba(110, 120, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.3); }
.btn.primary:hover svg { transform: translateX(4px); }
.btn.ghost { border: 1px solid var(--line); background: rgba(255, 255, 255, 0.05); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.btn.ghost:hover { transform: translateY(-3px); background: rgba(255, 255, 255, 0.1); border-color: rgba(190, 210, 255, 0.5); }
.btn.ghost:hover svg { transform: translateY(2px); }

.meta-row { display: flex; flex-wrap: wrap; align-items: center; gap: 28px 40px; margin-top: 44px; }
.socials { display: flex; gap: 10px; }
.socials a {
  display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid var(--line); background: rgba(255, 255, 255, 0.05); color: var(--muted);
  transition: all 0.3s;
}
.socials a:hover { color: #fff; transform: translateY(-4px); border-color: var(--blue); box-shadow: 0 10px 26px -8px rgba(79, 140, 255, 0.8); }
.stats { display: flex; gap: 32px; }
.stat { padding-left: 16px; border-left: 1px solid var(--line); }
.stat strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; }
.stat span { font-size: 12.5px; color: var(--muted); }

/* floating chips */
.chip {
  position: absolute; z-index: 4;
  display: flex; align-items: center; gap: 9px;
  padding: 9px 16px; border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(12, 18, 40, 0.55);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #dbe6ff;
  animation: fadeIn 1s ease 2s both, float 6s ease-in-out var(--delay) infinite;
}
.chip i { width: 8px; height: 8px; border-radius: 50%; display: block; }

/* scroll hint */
.scroll-hint {
  position: absolute; z-index: 6; bottom: 28px; left: var(--pad);
  display: flex; align-items: center; gap: 12px;
  color: var(--muted);
  animation: fadeIn 1s ease 2s both;
}
.mouse { position: relative; width: 24px; height: 38px; border: 1.5px solid rgba(190, 210, 255, 0.45); border-radius: 14px; }
.wheel { position: absolute; left: 50%; top: 8px; width: 3px; height: 7px; margin-left: -1.5px; border-radius: 3px; background: var(--cyan); animation: wheel 1.8s ease-in-out infinite; }
.scroll-text { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; letter-spacing: 0.2em; text-transform: uppercase; }

/* entrance animation */
.rise { opacity: 0; transform: translateY(26px); animation: rise 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) forwards; animation-delay: var(--d, 0s); }

@keyframes rise { to { opacity: 1; transform: none; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes dropIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: none; } }
@keyframes shine { to { background-position: -220% center; } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes ping { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(3.2); opacity: 0; } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes wheel { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(14px); } }
@keyframes nebula { from { transform: scale(1) translate(0, 0); } to { transform: scale(1.12) translate(-2%, 2%); } }

/* tablet & mobile */
@media (max-width: 1100px) {
  .chip { display: none; }
}
@media (max-width: 900px) {
  .nav-cta { display: none; }
  .burger { display: block; }
  .nav-links {
    display: none; position: absolute; top: calc(100% - 4px); left: 20px; right: 20px;
    flex-direction: column; border-radius: 20px; padding: 10px;
    background: rgba(8, 11, 26, 0.92);
  }
  .nav.open .nav-links { display: flex; }
  .nav-links a { padding: 14px 18px; }
  .hero-fade {
    background:
      linear-gradient(180deg, rgba(4, 5, 13, 0) 18%, rgba(4, 5, 13, 0.82) 50%, rgba(4, 5, 13, 0.95) 100%);
  }
  .hero-content { justify-content: flex-end; padding-top: 40vh; padding-bottom: 56px; }
  .scroll-hint { display: none; }
  .stats { gap: 22px; }
}
@media (max-width: 480px) {
  .logo-text { display: none; }
  .cta-row .btn { flex: 1 1 100%; justify-content: center; }
  .meta-row { margin-top: 30px; }
}
@media (prefers-reduced-motion: reduce) {
  .hero *, .hero *::before, .hero *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; animation-delay: 0s !important; }
  .rise { opacity: 1; transform: none; }
}
`;