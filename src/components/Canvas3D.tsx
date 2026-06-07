import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { AppState, HOTSPOTS, Hotspot } from "../types";
import audio from "../utils/audio";

interface Canvas3DProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onHotspotsUpdate: (hotspots: { id: string; x: number; y: number; visible: boolean }[]) => void;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({
  appState,
  setAppState,
  onHotspotsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Keep state refs for animation loop to avoid re-binding
  const stateRef = useRef(appState);
  useEffect(() => {
    stateRef.current = appState;
  }, [appState]);

  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [modelType, setModelType] = useState<"procedural" | "custom">("procedural");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // SCENE & SYSTEM SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0e12, 0.015);

    // CAMERA with premium focal perspective
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 5);

    // RENDERER with maximum fidelity configurations
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performant pixel ratio limit
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // CONTROLS for tactile product rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 10;
    controls.minDistance = 2.5;
    controls.enablePan = false;
    controls.enableZoom = false; // Disable zoom to prioritize main page scroll snapping
    // Slow orbit rotation when idle
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // PROCEDURAL STUDIO ENVIRONMENT GRAPHIC GENERATOR (Ensures highly photorealistic glass reflections instantly!)
    const generateProceduralEnvMap = (): THREE.Texture => {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Core dark studio background with high contrast strip lighting
        const grad = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
        grad.addColorStop(0, "#2c3e50");
        grad.addColorStop(0.3, "#0f171e");
        grad.addColorStop(1, "#020406");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Simulated neon flash bulb lights
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(50, 200, 30, 120);
        
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(380, 150, 40, 200);

        ctx.fillStyle = "#ff007f";
        ctx.fillRect(200, 40, 120, 20);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      return texture;
    };

    const envMap = generateProceduralEnvMap();
    scene.environment = envMap;
    scene.background = new THREE.Color(0x0c0e12);

    // LIGHTING SYSTEM
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Elegant key spotlight reflecting on glass edges
    const keySpotlight = new THREE.SpotLight(0xffffff, 8, 15, Math.PI / 6, 0.8, 1);
    keySpotlight.position.set(3, 6, 4);
    keySpotlight.castShadow = true;
    keySpotlight.shadow.bias = -0.001;
    scene.add(keySpotlight);

    // Glowing futuristic cyan secondary rim light
    const cyanRimLight = new THREE.DirectionalLight(0x00f3ff, 2.5);
    cyanRimLight.position.set(-4, -2, -3);
    scene.add(cyanRimLight);

    // Romantic magenta top light
    const magentaTopLight = new THREE.DirectionalLight(0xff00b7, 2.0);
    magentaTopLight.position.set(0, 5, -2);
    scene.add(magentaTopLight);

    // PRODUCT GEOMETRY (THE CHRONOS AETHER CORE)
    // Create nested layers inside a root group to allow coordinate mapping & scroll synchronizations
    const productGroup = new THREE.Group();
    scene.add(productGroup);

    // 1. Central Singularity Core (Morphing Emissive sphere)
    const coreGeo = new THREE.IcosahedronGeometry(0.38, 5);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f3ff,
      emissive: 0x015c73,
      emissiveIntensity: 3.5,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1.0,
      glow: 1.0,
    } as any);
    const singularityCore = new THREE.Mesh(coreGeo, coreMat);
    productGroup.add(singularityCore);

    // 2. Anti-Gravitational Metallic Gears (Outer structural brass rings & gear teeth)
    const gearGroup = new THREE.Group();
    productGroup.add(gearGroup);

    const goldMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6b800,
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMap: envMap,
    });

    const obsidianMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e1e24,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 0.9,
      envMap: envMap,
    });

    // Ring A (Z-Axis rotating obsidian ring)
    const outerRingA = new THREE.Mesh(
      new THREE.TorusGeometry(1.0, 0.05, 16, 100),
      obsidianMetalMat
    );
    outerRingA.rotation.x = Math.PI / 2;
    gearGroup.add(outerRingA);

    // Decorate ring with teeth/gears
    for (let i = 0; i < 8; i++) {
      const theta = (i / 8) * Math.PI * 2;
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.12), goldMetalMat);
      box.position.set(Math.cos(theta) * 1.0, 0, Math.sin(theta) * 1.0);
      box.rotation.y = -theta;
      outerRingA.add(box);
    }

    // Ring B (X-Axis rotating gold ring)
    const outerRingB = new THREE.Mesh(
      new THREE.TorusGeometry(1.18, 0.03, 16, 100),
      goldMetalMat
    );
    outerRingB.rotation.y = Math.PI / 4;
    gearGroup.add(outerRingB);

    // 3. Double-Transmissive Outer Refractive Lens (The high-end glass housing)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      transmission: 0.98, // Maximum glass transmission!
      ior: 1.54, // Silico refraction ratio
      roughness: 0.04,
      metalness: 0.05,
      thickness: 1.8, // Rich 3D refractive lensing depth
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      envMap: envMap,
      side: THREE.DoubleSide,
    });
    const outerGlassShell = new THREE.Mesh(
      new THREE.SphereGeometry(1.48, 64, 64),
      glassMat
    );
    productGroup.add(outerGlassShell);

    // Thin elegant aesthetic coordinate orbits (fine glowing lines)
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    const orbitLineA = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        new THREE.Path().absarc(0, 0, 1.48, 0, Math.PI * 2, true).getPoints(90).map(p => new THREE.Vector3(p.x, p.y, 0))
      ),
      lineMat
    );
    orbitLineA.rotation.x = Math.PI / 4;
    productGroup.add(orbitLineA);

    // 4. Tension Cosmic Droplets (Anharmonic mercury spheres floating under dynamic laws)
    const dropletGroup = new THREE.Group();
    productGroup.add(dropletGroup);

    const liquidMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMap: envMap,
    });

    const droplets: { mesh: THREE.Mesh; orbitRadius: number; angle: number; speed: number; yOffset: number; baseSpeedY: number }[] = [];
    const dropletCount = 6;
    for (let i = 0; i < dropletCount; i++) {
      const radius = 0.08 + Math.random() * 0.07;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        liquidMetalMat
      );
      
      const orbitRadius = 0.55 + Math.random() * 0.5;
      const angle = (i / dropletCount) * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 0.6;
      
      sphere.position.set(
        Math.cos(angle) * orbitRadius,
        yOffset,
        Math.sin(angle) * orbitRadius
      );
      dropletGroup.add(sphere);
      
      droplets.push({
        mesh: sphere,
        orbitRadius,
        angle,
        speed: 0.4 + Math.random() * 0.8,
        yOffset,
        baseSpeedY: 0.2 + Math.random() * 0.3
      });
    }

    // 5. Dynamic Spatial Particle Cloud
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.random() * 2.5;
      const y = (Math.random() - 0.5) * 2;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      particleAngles[i] = angle;
      particleRadii[i] = radius;
      particleSpeeds[i] = 0.1 + Math.random() * 0.5;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    // Create soft rounded custom texture using Canvas for responsive particles (prevents harsh square particles!)
    const createParticleTexture = (): THREE.Texture => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.3, "rgba(0, 243, 255, 0.4)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      map: createParticleTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMat);
    scene.add(particleSystem);


    // OPTIONAL GLTF SYSTEM FOR ASSET UPGRADE (Fully implemented fallback pattern)
    const startGLTFLoad = () => {
      const dracoLoader = new DRACOLoader();
      // Use standard CDN paths for Draco decoder files
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      // We expose GLTF asset path if available, else we run with perfect procedural scenery
      // If the user uploads or hosts custom glb, they can replace current url
      const modelUrl = "/assets/custom_product.glb"; // Placeholder target

      loader.load(
        modelUrl,
        (gltf) => {
          // Process loaded GLTF
          setLoadingProgress(100);
          setModelType("custom");
          
          // Clear procedural models
          while(productGroup.children.length > 0){
             productGroup.remove(productGroup.children[0]);
          }

          // Apply state of the art glass/metals to loaded hierarchy
          gltf.scene.traverse((node) => {
            if (node instanceof THREE.Mesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              
              // Apply physical material mappings depending on node name / properties
              if (node.name.toLowerCase().includes("glass") || node.name.toLowerCase().includes("lens")) {
                node.material = glassMat;
              } else if (node.name.toLowerCase().includes("gold") || node.name.toLowerCase().includes("brass")) {
                node.material = goldMetalMat;
              } else if (node.name.toLowerCase().includes("dark") || node.name.toLowerCase().includes("body")) {
                node.material = obsidianMetalMat;
              } else if (node.name.toLowerCase().includes("core")) {
                node.material = coreMat;
              }
            }
          });

          productGroup.add(gltf.scene);
        },
        (xhr) => {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(percent);
        },
        (err) => {
          // Handle error gracefully - keep rendering beautiful custom procedural scene
          console.warn("Using fallback procedural 3D model (custom_product.glb not present at path)");
          setLoadError("Asset loader defaulting to Procedural Core Model");
          setLoadingProgress(100);
        }
      );
    };

    // Load custom model if desired, but we immediately finish loader with procedural
    setLoadingProgress(45);
    setTimeout(() => {
      // Procedural model is active instantly
      setLoadingProgress(100);
    }, 850);


    // HOTSPOT ANNOTATION MATRICES PROJECTION FUNCTION
    const tempV3 = new THREE.Vector3();
    const updateHotspotsScreenCoordinates = () => {
      const parentRect = containerRef.current?.getBoundingClientRect();
      if (!parentRect) return;

      const results = HOTSPOTS.map((hotspot) => {
        // Find position relative to rotating productGroup
        tempV3.fromArray(hotspot.position);
        tempV3.applyMatrix4(productGroup.matrixWorld);

        // Map to 2D normalized screen vector
        tempV3.project(camera);

        // Check if the hotspot is behind the camera horizon
        const visible = tempV3.z <= 1;

        // Convert projection coordinates (-1 to 1) to clean pixel coordinates
        const x = (tempV3.x * .5 + .5) * parentRect.width;
        const y = (-(tempV3.y * .5) + .5) * parentRect.height;

        return {
          id: hotspot.id,
          x,
          y,
          visible,
        };
      });

      onHotspotsUpdate(results);
    };


    // CORE PHYSICAL ANIMATION & WARPING RENDER LOOP
    const clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Read real-time control variables from State (Ref)
      const { gravity, timeSpeed, spaceDistortion, activeSection } = stateRef.current;

      // Modulate spatial sound hum depending on forces
      audio.modulateHum(gravity, timeSpeed, spaceDistortion);

      // Apply dynamic rotation based on scroll stage & timeSpeed
      const effectiveTimeDelta = delta * timeSpeed;

      // Base idle rotations overridden dynamically
      if (timeSpeed > 0) {
        outerRingA.rotation.z += effectiveTimeDelta * 0.9;
        outerRingB.rotation.z -= effectiveTimeDelta * 1.4;
        gearGroup.rotation.y += effectiveTimeDelta * 0.3;
        
        // Singularity core pulse
        const coreScale = 1.0 + Math.sin(elapsed * 5 * timeSpeed) * 0.08 * spaceDistortion;
        singularityCore.scale.set(coreScale, coreScale, coreScale);
      }

      // 1. ANARCHIC TIME & SPACE GLASS DISTORTION SHADER WARM
      // In high spaceDistortion, we twist & warp the vertices of our inner core and glass mesh
      if (spaceDistortion > 1) {
        // Rotate outer shell in eccentric wobble
        outerGlassShell.rotation.y = elapsed * 0.2 + (Math.sin(elapsed) * (spaceDistortion - 1) * 0.15);
        outerGlassShell.rotation.x = Math.cos(elapsed * 0.5) * (spaceDistortion - 1) * 0.1;
      } else {
        outerGlassShell.rotation.y += delta * 0.05;
      }

      // 2. GRAVITY REVOLUTIONARY FORCES ON DROPLETS (MERCURY DROPS)
      // Modulate orbital positions according to physical gravity level:
      // In 0G: Droplets float in wide circles, hovering slowly up and down
      // In Normal (1G): Structured beautiful orbital plane
      // In Reverse Gravity (-1G): Upward tension pulling orbits
      // In Hyper Gravity (5G): Heavy drops pulled downwards, rotating fast
      droplets.forEach((drop, index) => {
        // Update orbiting angles
        drop.angle += effectiveTimeDelta * drop.speed;
        
        let targetOrbitRadius = drop.orbitRadius;
        let targetY = drop.yOffset;

        // Gravity-driven warping
        if (gravity === 0) {
          // Zero-G: floating drift state
          targetOrbitRadius = drop.orbitRadius * 1.3;
          targetY = drop.yOffset + Math.sin(elapsed * 1.5 + index) * 0.35;
        } else if (gravity === -1) {
          // Reverse Gravity: upward pull
          targetOrbitRadius = drop.orbitRadius * 0.9;
          targetY = 0.5 + Math.cos(elapsed * 2 + index) * 0.15;
        } else if (gravity === 5) {
          // Hyper Gravity: downward compression & high rotational velocity
          targetOrbitRadius = drop.orbitRadius * 0.5;
          targetY = -0.58 + Math.cos(elapsed * 4 + index) * 0.05;
          drop.angle += effectiveTimeDelta * drop.speed * 2.5; // Rotate faster!
        }

        // Interpolate current mesh positions smoothly to target physics positions
        const p = drop.mesh.position;
        const targetX = Math.cos(drop.angle) * targetOrbitRadius;
        const targetZ = Math.sin(drop.angle) * targetOrbitRadius;

        p.x += (targetX - p.x) * 0.08;
        p.y += (targetY - p.y) * 0.08;
        p.z += (targetZ - p.z) * 0.08;

        // Fluid squish scaling depending on gravity!
        if (gravity === 5) {
          // Flatten under intense G forces
          drop.mesh.scale.set(1.4, 0.45, 1.4);
        } else if (gravity === 0) {
          // Sphere expands perfectly
          const breath = 1.0 + Math.sin(elapsed * 2 + index) * 0.1;
          drop.mesh.scale.set(breath, breath, breath);
        } else {
          drop.mesh.scale.set(1, 1, 1);
        }
      });

      // 3. GRAVITY & TIME WARPING ON PARTICLES
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        // Rotate points
        particleAngles[i] += effectiveTimeDelta * particleSpeeds[i] * 0.3;
        
        let orbitRadius = particleRadii[i];
        let targetY = posArray[i * 3 + 1];

        // Particle reaction to custom Gravity parameters
        if (gravity === 0) {
          // Free expansion float
          orbitRadius *= 1.08;
          if (orbitRadius > 3.5) particleRadii[i] = 0.4; // wrap
          targetY += Math.sin(elapsed + i) * 0.005;
        } else if (gravity === -1) {
          // Dynamic upward flow
          targetY += delta * 1.5;
          if (targetY > 2.5) targetY = -2.5;
        } else if (gravity === 5) {
          // Catastrophic falling vortex
          targetY -= delta * 5.0;
          if (targetY < -2.5) targetY = 2.5;
          orbitRadius *= 0.95;
          if (orbitRadius < 0.2) particleRadii[i] = 2.5;
        } else {
          // Default normal orbital flow
          targetY += Math.sin(elapsed * 0.5 + i) * 0.0019;
        }

        posArray[i * 3] = Math.cos(particleAngles[i]) * orbitRadius;
        posArray[i * 3 + 1] = targetY;
        posArray[i * 3 + 2] = Math.sin(particleAngles[i]) * orbitRadius;
      }
      posAttr.needsUpdate = true;

      // 4. SCROLL TIMELINE LERPING (Synchronize Section Timeline to visual scene components)
      // Linear lerp values transition the camera & mesh orientations flawlessly
      const rotYTarget = activeSection * (Math.PI * 0.5);
      productGroup.rotation.y += (rotYTarget - productGroup.rotation.y) * 0.05;

      // Section-specific automatic camera adjustments
      let targetCamX = 0;
      let targetCamY = 0.5;
      let targetCamZ = 5;

      if (activeSection === 1) {
        // Lens section: Zoom in close to focus on glass refraction
        targetCamZ = 2.8;
        targetCamY = 0.2;
      } else if (activeSection === 2) {
        // Mechanic gears: Angle camera lower looking upward
        targetCamY = 1.3;
        targetCamX = 0.8;
        targetCamZ = 3.8;
      } else if (activeSection === 3) {
        // Fluids section: Complex spatial offset to look asymmetrical
        targetCamX = -1.2;
        targetCamY = -0.5;
        targetCamZ = 4.2;
      }

      camera.position.x += (targetCamX - camera.position.x) * 0.06;
      camera.position.y += (targetCamY - camera.position.y) * 0.06;
      camera.position.z += (targetCamZ - camera.position.z) * 0.06;

      // Update control systems
      controls.update();

      // Coordinate mapping calculations
      updateHotspotsScreenCoordinates();

      renderer.render(scene, camera);
    };

    animate();

    // DYNAMIC CONTAINER RESIZE HANDLER
    const handleResize = () => {
      const parent = containerRef.current;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    // CLEANUP MEMORY ON UNMOUNT (Critical to prevent multiple WebGL Context leaks!)
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      
      // Dispose materials & geometries safely
      coreGeo.dispose();
      coreMat.dispose();
      outerGlassShell.geometry.dispose();
      outerGlassShell.material.dispose();
      outerRingA.geometry.dispose();
      outerRingB.geometry.dispose();
      goldMetalMat.dispose();
      obsidianMetalMat.dispose();
      liquidMetalMat.dispose();
      particleGeometry.dispose();
      particleMat.dispose();
      envMap.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div id="three-container" ref={containerRef} className="relative w-full h-full select-none bg-slate-950/20">
      <canvas ref={canvasRef} className="absolute inset-x-0 bottom-0 top-0 block h-full w-full outline-none" />

      {/* Embedded High Fidelity Material Progress UI */}
      {loadingProgress < 100 && (
        <div id="3d-loader" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md transition-opacity duration-1000">
          <div className="mb-4 text-xs font-semibold tracking-[0.4em] text-cyan-400">LOADING METRIC ASSETS</div>
          <div className="relative h-[2px] w-48 overflow-hidden rounded bg-slate-800">
            <div
              className="absolute left-0 top-0 h-full bg-cyan-400 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="mt-3 text-[10px] font-mono tracking-widest text-slate-500">{loadingProgress}% RESOLVED</div>
        </div>
      )}
    </div>
  );
};
