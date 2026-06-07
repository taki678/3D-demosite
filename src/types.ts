export interface AppState {
  gravity: number; // 0 for zero gravity, 1 for normal, -1 for reverse, 5 for hyper
  timeSpeed: number; // multiplier for animation speed (0 to 4)
  spaceDistortion: number; // multiplier for geometric twist/deformation
  activeSection: number; // index of currently scrolled section
  audioEnabled: boolean; // sound state
  hoveredHotspot: string | null; // ID of currently hovered spot
}

export interface Hotspot {
  id: string;
  label: string;
  description: string;
  position: [number, number, number]; // 3D coordinates in scene
  spec: string;
}

export const HOTSPOTS: Hotspot[] = [
  {
    id: "refractive-lens",
    label: "REFRACTIVE CORE CRYSTAL",
    description: "Solid double-transmissive silica glass utilizing double-layer light refraction to isolate external chronal debris.",
    position: [0, 1.4, 0],
    spec: "transmission: 0.98 | ior: 1.54"
  },
  {
    id: "gravity-rings",
    label: "ANTI-GRAVITATIONAL GEARS",
    description: "Opposing-axis metallic alloys engineered to suspend magnetic fields and neutralize surrounding direct g-forces.",
    position: [1.3, 0.2, 0.5],
    spec: "anisotropy: 0.8 | clearcoat: 1.0"
  },
  {
    id: "singularity-core",
    label: "CHRONAL SINGULARITY",
    description: "The primary temporal generator. Emits visual energy frequencies that warp space and time according to energy load.",
    position: [0, 0, 0],
    spec: "emissive: #00f3ff | power: 12.8 GW"
  },
  {
    id: "tension-fluid",
    label: "COHESIVE METALLIC LIQUID",
    description: "Fluid metallic nodes floating freely in zero gravity. High surface tension polymer reacting to ambient interactive currents.",
    position: [-1.2, -0.6, -0.6],
    spec: "viscosity: 8.5 Pa·s | charge: +4.2e"
  }
];
