import React, { useState } from "react";
import { HOTSPOTS, Hotspot } from "../types";
import { audio } from "../utils/audio";
import { Radio, X, Compass, Layers, Atom, Dot } from "lucide-react";

interface ProjectedHotspot {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}

interface AnnotationSystemProps {
  projectedSpots: ProjectedHotspot[];
  audioEnabled: boolean;
  hoveredHotspot: string | null;
  setHoveredHotspot: (id: string | null) => void;
}

export const AnnotationSystem: React.FC<AnnotationSystemProps> = ({
  projectedSpots,
  audioEnabled,
  hoveredHotspot,
  setHoveredHotspot,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const handleHotspotClick = (spot: Hotspot) => {
    audio.playChime();
    setSelectedHotspot(spot);
  };

  const handleHotspotHoverInput = (id: string) => {
    setHoveredHotspot(id);
    if (audioEnabled) {
      audio.playTick();
    }
  };

  const getHotspotIcon = (id: string) => {
    switch (id) {
      case "refractive-lens":
        return <Compass size={13} className="text-pink-400" />;
      case "gravity-rings":
        return <Layers size={13} className="text-yellow-400" />;
      case "singularity-core":
        return <Atom size={13} className="text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />;
      default:
        return <Radio size={13} className="text-emerald-400" />;
    }
  };

  return (
    <div id="annotation-overlay-root" className="absolute inset-0 pointer-events-none overflow-hidden z-10 w-full h-full">
      {/* 2D Projected Hotspots Markers */}
      {projectedSpots.map((projected) => {
        if (!projected.visible) return null;

        const info = HOTSPOTS.find((h) => h.id === projected.id);
        if (!info) return null;

        const isHovered = hoveredHotspot === projected.id;

        return (
          <div
            key={projected.id}
            id={`marker-${projected.id}`}
            style={{
              position: "absolute",
              left: `${projected.x}px`,
              top: `${projected.y}px`,
              transform: "translate(-50%, -50%)",
            }}
            className="pointer-events-auto group transition-all duration-300"
          >
            {/* Concentric Pulsing Radar Anchor Rings */}
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-7 w-7 rounded-full bg-cyan-400/20 opacity-75 group-hover:scale-150 animate-ping" />
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-cyan-400/40 opacity-90 group-hover:bg-cyan-400" />
              
              {/* Trigger Button */}
              <button
                id={`btn-hotspot-${projected.id}`}
                onMouseEnter={() => handleHotspotHoverInput(projected.id)}
                onMouseLeave={() => setHoveredHotspot(null)}
                onClick={() => handleHotspotClick(info)}
                className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-cyan-400/50 shadow-cyan-400/20 text-white hover:text-cyan-400 hover:scale-110 cursor-pointer transition-all"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
              </button>

              {/* Minimal floating tooltip (Hover State) */}
              <div
                id={`tooltip-${projected.id}`}
                className={`absolute left-8 flex flex-col pointer-events-none rounded-xl border border-white/5 bg-slate-950/80 px-3.5 py-2 backdrop-blur-md shadow-xl transition-all duration-300 w-48 ${
                  isHovered ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-2 scale-90"
                }`}
              >
                <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">{info.label}</span>
                <span className="text-[8px] font-mono text-slate-400 leading-tight mt-0.5">{info.spec}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Detail Specs Overlay Drawer (Modal) */}
      {selectedHotspot && (
        <div
          id="spotlight-drawer"
          className="absolute right-6 top-6 bottom-6 pointer-events-auto flex items-center z-30"
        >
          <div className="w-80 rounded-2xl border border-white/10 bg-slate-950/85 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between max-h-[85vh] transition-all animate-fade-in">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  {getHotspotIcon(selectedHotspot.id)}
                  <span className="text-[10px] font-mono text-slate-400 tracking-wider font-bold">COMPONENT SPEC</span>
                </div>
                <button
                  id="close-drawer"
                  onClick={() => {
                    audio.playTick();
                    setSelectedHotspot(null);
                  }}
                  className="rounded-full p-1 border border-white/5 hover:border-white/25 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Primary Graphic & Detailed Label */}
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide uppercase font-sans">
                    {selectedHotspot.label}
                  </h3>
                  <div className="mt-1 font-mono text-[9px] text-cyan-400 flex items-center gap-1.5 bg-cyan-950/20 py-1 px-2 rounded w-fit border border-cyan-500/10">
                    <Dot size={12} className="animate-ping text-cyan-400" />
                    <span>METRIC: {selectedHotspot.spec}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedHotspot.description}
                </p>
              </div>
            </div>

            {/* Simulated hardware state block */}
            <div className="mt-6 space-y-3 pt-4 border-t border-white/5 font-mono text-[9px]">
              <div>
                <span className="text-slate-500">PHYSICAL ALIGNMENT :</span>
                <p className="text-slate-300 text-[10px] truncate mt-0.5">X: {selectedHotspot.position[0]}, Y: {selectedHotspot.position[1]}, Z: {selectedHotspot.position[2]}</p>
              </div>
              <div>
                <span className="text-slate-500">THERMAL LOAD :</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 bg-slate-800 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-cyan-400 w-1/3 animate-pulse" />
                  </div>
                  <span className="text-cyan-400 font-bold">34.2 °C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AnnotationSystem;
