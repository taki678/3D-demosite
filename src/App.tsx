import { useEffect, useState, useRef } from "react";
import { AppState, HOTSPOTS } from "./types";
import { Canvas3D } from "./components/Canvas3D";
import { SidebarOverlay } from "./components/SidebarOverlay";
import { AnnotationSystem } from "./components/AnnotationSystem";
import { audio } from "./utils/audio";
import { Compass, RotateCw, Shield, MapPin, Eye, MousePointerClick, RefreshCw, Layers } from "lucide-react";

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    gravity: 1, // Start with normal 1G Harmony
    timeSpeed: 1, // Start with normal speed
    spaceDistortion: 1, // Standard flatness
    activeSection: 0,
    audioEnabled: false, // Wait for user interaction to allow audio
    hoveredHotspot: null,
  });

  const [projectedSpots, setProjectedSpots] = useState<{ id: string; x: number; y: number; visible: boolean }[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeSectionRef = useRef<number>(0);
  useEffect(() => {
    activeSectionRef.current = appState.activeSection;
  }, [appState.activeSection]);

  // Allow scroll gesture anywhere on the window to scroll the narrative container
  useEffect(() => {
    let lastScrollTime = 0;
    const cooldown = 700; // 700ms cooldown to match smooth section snap animation

    const handleGlobalWheel = (e: WheelEvent) => {
      const el = scrollContainerRef.current;
      if (!el) return;

      // If the scroll target is already inside the narrative scrollContainer, let it handle natively
      if (e.target && el.contains(e.target as Node)) {
        return;
      }

      // Filter out tiny adjustments or jittery events
      if (Math.abs(e.deltaY) < 12) return;

      const now = Date.now();
      if (now - lastScrollTime < cooldown) {
        return;
      }

      const activeIdx = activeSectionRef.current;
      let nextIndex = activeIdx;

      if (e.deltaY > 0) {
        nextIndex = Math.min(3, activeIdx + 1);
      } else {
        nextIndex = Math.max(0, activeIdx - 1);
      }

      if (nextIndex !== activeIdx) {
        lastScrollTime = now;
        jumpToSection(nextIndex);
      }
    };

    let touchStartY = 0;
    const handleGlobalTouchStart = (e: TouchEvent) => {
      const el = scrollContainerRef.current;
      if (!el || (e.target && el.contains(e.target as Node))) {
        return;
      }
      touchStartY = e.touches[0].clientY;
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      const el = scrollContainerRef.current;
      if (!el || (e.target && el.contains(e.target as Node))) {
        return;
      }
      
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;

      // Minimum swipe distance threshold to prevent accidental jump
      if (Math.abs(deltaY) < 40) return;

      const now = Date.now();
      if (now - lastScrollTime < cooldown) {
        return;
      }

      const activeIdx = activeSectionRef.current;
      let nextIndex = activeIdx;

      if (deltaY > 0) {
        nextIndex = Math.min(3, activeIdx + 1);
      } else {
        nextIndex = Math.max(0, activeIdx - 1);
      }

      if (nextIndex !== activeIdx) {
        lastScrollTime = now;
        jumpToSection(nextIndex);
      }
      touchStartY = currentY;
    };

    window.addEventListener("wheel", handleGlobalWheel, { passive: true });
    window.addEventListener("touchstart", handleGlobalTouchStart, { passive: true });
    window.addEventListener("touchmove", handleGlobalTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleGlobalWheel);
      window.removeEventListener("touchstart", handleGlobalTouchStart);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
    };
  }, []);

  // Track scroll position to update active section (0 to 3)
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollContainerRef.current;
      if (!el) return;

      const scrollTop = el.scrollTop;
      const height = el.clientHeight;
      const index = Math.min(3, Math.max(0, Math.round(scrollTop / height)));

      if (index !== appState.activeSection) {
        audio.playTick();
        setAppState((prev) => ({ ...prev, activeSection: index }));
      }
    };

    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, [appState.activeSection]);

  // Handle manual navigation jump
  const jumpToSection = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    audio.playTick();
    el.scrollTo({
      top: index * el.clientHeight,
      behavior: "smooth",
    });
    setAppState((prev) => ({ ...prev, activeSection: index }));
  };

  const handleHotspotsUpdate = (spots: { id: string; x: number; y: number; visible: boolean }[]) => {
    setProjectedSpots(spots);
  };

  const setHoveredHotspot = (id: string | null) => {
    setAppState((prev) => ({ ...prev, hoveredHotspot: id }));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07090e] font-sans text-white select-none">
      
      {/* BACKGROUND DECORATIVE GRID */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* SOLID CHIC RADIAL SHADOW VIGNETTE */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#07090e_90%)]" />

      {/* CORE CANVAS: Renders the gorgeous real-time 3D refraction & physical models */}
      <div className="absolute inset-0 h-full w-full">
        <Canvas3D
          appState={appState}
          setAppState={setAppState}
          onHotspotsUpdate={handleHotspotsUpdate}
        />
      </div>

      {/* DETAILED INTERACTIVE COORDINATES LAYER */}
      <AnnotationSystem
        projectedSpots={projectedSpots}
        audioEnabled={appState.audioEnabled}
        hoveredHotspot={appState.hoveredHotspot}
        setHoveredHotspot={setHoveredHotspot}
      />

      {/* PREMIUM HEADER */}
      <header className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-20 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="text-sm font-black tracking-widest text-cyan-400">Æ</span>
          </div>
          <div>
            <span className="text-xs font-bold tracking-[0.4em] text-white">A E T H E R</span>
            <div className="text-[8px] font-mono tracking-widest text-[#567290]">CHRONOS INSTRUMENTS</div>
          </div>
        </div>

        {/* Live physical diagnostic readout */}
        <div className="hidden md:flex pointer-events-auto items-center gap-6 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5 border border-white/5 bg-slate-950/40 px-3 py-1.5 rounded-lg backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-500">GRAVITY STATE:</span>
            <span className="text-white font-semibold">
              {appState.gravity === 1 ? "1.0G COHERENT" : appState.gravity === 0 ? "ABSENT (0G)" : appState.gravity === -1 ? "-1G REVERSED" : "5.0G INTENSE"}
            </span>
          </div>
          <div className="border border-white/5 bg-slate-950/40 px-3 py-1.5 rounded-lg backdrop-blur-md">
            <span className="text-slate-500">FOCAL DEPTH:</span>{" "}
            <span className="text-cyan-400 font-semibold">{appState.spaceDistortion > 1 ? "WOBBLING SHIELD" : "NORMAL 1.54"}</span>
          </div>
        </div>
      </header>

      {/* PRIMARY GRID LAYOUT CONTAINER: Interactive Narrative (Left) + Physics Sandbox Sidebar (Right) */}
      <div className="absolute inset-0 z-20 flex flex-col md:flex-row pointer-events-none p-6 pt-24 justify-between">
        
        {/* LEFT COLUMN: Narrative Scroll Stories */}
        <div className="relative w-full md:w-[420px] h-[50vh] md:h-full flex flex-col pointer-events-auto">
          {/* Section Indicator Tabs */}
          <div className="flex gap-1.5 mb-4 border border-white/5 bg-slate-950/50 p-1.5 rounded-xl w-fit backdrop-blur-md">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => jumpToSection(idx)}
                className={`text-[9px] font-mono tracking-wider px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  appState.activeSection === idx
                    ? "bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>

          {/* Scrolling Story Box */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar pr-4 select-text"
          >
            {/* Story Node 1 */}
            <div className="snap-start h-full flex flex-col justify-center space-y-3 pb-8">
              <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 font-semibold uppercase">SECTION 01 / THE CORE</span>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white font-sans leading-none">
                Aether Chronum Geometry
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                A masterpiece that beautifully bends spatial boundaries. Utilizing high-transmission solid glass structures nested with opposing-axis clockwork mechanisms to sustain magnetic fields in WebGL space.
              </p>
              <div className="flex gap-2 text-[9px] font-mono text-slate-500 mt-2">
                <span className="flex items-center gap-1 border border-white/10 px-2 py-0.5 rounded-full"><Eye size={10} /> Orbit Controls Enabled</span>
                <span className="flex items-center gap-1 border border-white/10 px-2 py-0.5 rounded-full"><MousePointerClick size={10} /> Tap core to reveal specs</span>
              </div>
            </div>

            {/* Story Node 2 */}
            <div className="snap-start h-full flex flex-col justify-center space-y-3 pb-8">
              <span className="text-[10px] font-mono tracking-[0.3em] text-pink-400 font-semibold uppercase">SECTION 02 / REFRACTION LENS</span>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white leading-none">
                Double-Transmission Silica glass
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                The massive outer crystal housing features a refraction index of 1.54. It acts as an physical lens, distorting lights, particles, and core components into a spectacular cosmic prism. Turn up the &quot;Spatial Wobble&quot; on the right to witness visual space distortion.
              </p>
            </div>

            {/* Story Node 3 */}
            <div className="snap-start h-full flex flex-col justify-center space-y-3 pb-8">
              <span className="text-[10px] font-mono tracking-[0.3em] text-yellow-400 font-semibold uppercase">SECTION 03 / GRAVITATION CONTROL</span>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white leading-none">
                Defying Direct Forces
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock the parameters of universe constraints. Choose Zero-G, Reverse Gravity, or Hyper-G on the panel to witness cosmic particle dust systems and luxury metal gears react beautifully under simulated physics.
              </p>
            </div>

            {/* Story Node 4 */}
            <div className="snap-start h-full flex flex-col justify-center space-y-3 pb-8">
              <span className="text-[10px] font-mono tracking-[0.3em] text-emerald-400 font-semibold uppercase">SECTION 04 / METALLIC FLUIDS</span>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white leading-none">
                Orbital Cohesive Mercury
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch multiple mercury liquid nanoparticles glide in precise geometric orbits around the central singularity. They fluidly extend, merge, and float depending on the local gravity model running on every render frame.
              </p>
            </div>
          </div>

          {/* Footer Guide indicator */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              SCROLL NARRATIVE OR PRESS PRESETS
            </span>
            <span>0{appState.activeSection + 1} / 04</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Control Sandbox */}
        <div className="relative w-full md:w-auto h-[40vh] md:h-full mt-4 md:mt-0 flex flex-col pointer-events-auto">
          <SidebarOverlay
            appState={appState}
            setAppState={setAppState}
          />
        </div>

      </div>

      {/* FOOTER METADATA COGNITIONS */}
      <footer className="absolute bottom-4 inset-x-6 p-2 flex justify-between items-center z-20 pointer-events-none font-mono text-[9px] text-[#4d637c]">
        <div>© 2026 AETHER LABS. ALL PHYSICAL LAWS REVOKED.</div>
        <div className="hidden sm:block">AWARDS NOMINEE / THREE.JS PORTFOLIO ENGINE</div>
      </footer>
    </div>
  );
}
