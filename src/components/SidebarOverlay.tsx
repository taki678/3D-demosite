import React from "react";
import { AppState } from "../types";
import { audio } from "../utils/audio";
import { RotateCw, Shield, Play, Pause, Zap, RefreshCw, Volume2, VolumeX, Radio } from "lucide-react";

interface SidebarOverlayProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const SidebarOverlay: React.FC<SidebarOverlayProps> = ({
  appState,
  setAppState,
}) => {
  const toggleAudio = () => {
    const nextState = !appState.audioEnabled;
    audio.setEnabled(nextState);
    if (nextState) {
      audio.playChime();
    }
    setAppState((prev) => ({ ...prev, audioEnabled: nextState }));
  };

  const selectGravity = (val: number) => {
    audio.playTick();
    setAppState((prev) => ({ ...prev, gravity: val }));
  };

  const selectTimeSpeed = (val: number) => {
    audio.playTick();
    setAppState((prev) => ({ ...prev, timeSpeed: val }));
  };

  const adjustSpaceDistort = (val: number) => {
    audio.playDistortEffect(val);
    setAppState((prev) => ({ ...prev, spaceDistortion: val }));
  };

  return (
    <div id="sidebar-controls" className="pointer-events-auto flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-6 backdrop-blur-xl md:w-80 h-full shadow-2xl transition-all duration-500">
      
      {/* SECTION 1: HEADER & SYSTEM DIAGNOSTICS */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400">AETHER CHRONUM v10.42</span>
            <button
              id="audio-toggle"
              onClick={toggleAudio}
              className={`flex items-center justify-center rounded-full p-2.5 transition-all cursor-pointer ${
                appState.audioEnabled
                  ? "bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 font-bold"
                  : "bg-slate-800/40 border border-slate-700/30 text-slate-400 hover:text-slate-200"
              }`}
              title={appState.audioEnabled ? "Disable Synthesizer Sounds" : "Enable Tactile Sound Synthesis"}
            >
              {appState.audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
          <h2 className="mt-2 text-xl font-medium tracking-tight text-white font-sans">
            Physics Simulator
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Beautifully defy gravity and warp spatial metrics inside the refractive glass matrix.
          </p>
        </div>

        {/* SECTION 2: GRAVITY PHYSICS CONTROL */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">
            [1/3] Gravitational Bias
          </label>
          <div className="grid grid-cols-2 gap-1.5 font-mono">
            {[
              { label: "0G DRIFT", val: 0, desc: "Weightless dispersion" },
              { label: "1G HARMONY", val: 1, desc: "Stable orbit" },
              { label: "REVERSE G", val: -1, desc: "Anti-gravitational rise" },
              { label: "VORTEX 5G", val: 5, desc: "High density collapse" }
            ].map((grav) => {
              const active = appState.gravity === grav.val;
              return (
                <button
                  key={grav.label}
                  onClick={() => selectGravity(grav.val)}
                  className={`text-left p-2.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                    active
                      ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-medium"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold tracking-wider">{grav.label}</div>
                  <div className="text-[8px] text-slate-500 mt-0.5 line-clamp-1">{grav.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: TIME SPEED DILATION */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400">
            <span>[2/3] Temporal Speed</span>
            <span className="text-cyan-400 font-bold">{appState.timeSpeed.toFixed(2)}x</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="4"
              step="0.05"
              value={appState.timeSpeed}
              onChange={(e) => selectTimeSpeed(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 px-1">
              <button onClick={() => selectTimeSpeed(0)} className="hover:text-slate-300">FREEZE (0x)</button>
              <button onClick={() => selectTimeSpeed(1)} className="hover:text-slate-300">STABLE (1x)</button>
              <button onClick={() => selectTimeSpeed(3)} className="hover:text-slate-300">WARPING (3x)</button>
            </div>
          </div>
        </div>

        {/* SECTION 4: SPACE LENS WARPING */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400">
            <span>[3/3] Spatial Wobble</span>
            <span className="text-pink-400 font-bold">{appState.spaceDistortion === 1 ? "1.00x (Standard)" : `${appState.spaceDistortion.toFixed(2)}x (Warp)`}</span>
          </div>
          <div className="flex gap-2">
            {[1.0, 1.8, 3.0].map((warpVal) => {
              const active = appState.spaceDistortion === warpVal;
              return (
                <button
                  key={warpVal}
                  onClick={() => adjustSpaceDistort(warpVal)}
                  className={`flex-1 font-mono text-[9px] p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    active
                      ? "bg-pink-500/10 border-pink-400 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.1)] font-semibold"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {warpVal === 1.0 ? "FLAT" : `${warpVal.toFixed(1)}x TWIST`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5: LOWER TECH READOUTS */}
      <div className="mt-6 border-t border-slate-800/50 pt-4 font-mono text-[9px] text-slate-500 space-y-2">
        <div className="flex justify-between">
          <span>COOPERATIVE ENTROPY :</span>
          <span className="text-slate-300 font-semibold">
            {appState.gravity === 5 ? "MAXIMUM CATASTROPHE" : "0.024 Hz"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>SURFACE TENSION :</span>
          <span className="text-slate-400">
            {appState.gravity === 0 ? "ABSENT (FLOAT)" : "854.2 mN/m"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>REFRACTIVE DISPERSION :</span>
          <span className="text-cyan-400">{appState.spaceDistortion > 1 ? "ANAMORPHIC SPLIT" : "CORNEAL 1.54"}</span>
        </div>
        <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-800/60 mt-1">
          <span className="text-cyan-400/90 font-bold">PHYSICS BREAKER :</span>
          <span className="animate-pulse flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </div>
      </div>
      
    </div>
  );
};
export default SidebarOverlay;
