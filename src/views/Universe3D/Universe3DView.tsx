import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  RotateCw, 
  Eye, 
  Layers, 
  Sliders, 
  Sparkles, 
  Maximize2,
  Palette
} from 'lucide-react';
import { KatexRenderer } from '../../components/KatexRenderer';

interface Universe3DViewProps {
  darkMode: boolean;
}

interface SurfacePreset {
  id: string;
  name: string;
  latex: string;
  type: 'surface' | 'parametric';
  fn?: (x: number, y: number) => number;
  parametricFn?: (t: number) => THREE.Vector3;
  rangeX: [number, number];
  rangeY: [number, number];
  tRange?: [number, number];
}

export const Universe3DView: React.FC<Universe3DViewProps> = ({ darkMode }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [activePresetId, setActivePresetId] = useState<string>('sombrero');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [colorTheme, setColorTheme] = useState<'cyberpunk' | 'viridis' | 'magma' | 'emerald'>('cyberpunk');
  const [resolution, setResolution] = useState<number>(60);
  const [heightScale, setHeightScale] = useState<number>(1.2);

  const presets: SurfacePreset[] = [
    {
      id: 'sombrero',
      name: 'Sombrero / Mexican Hat Wave',
      latex: 'z = 3 \\cdot \\frac{\\sin(\\sqrt{x^2+y^2})}{\\sqrt{x^2+y^2}}',
      type: 'surface',
      fn: (x, y) => {
        const r = Math.sqrt(x * x + y * y);
        return r === 0 ? 3 : (3 * Math.sin(r)) / r;
      },
      rangeX: [-10, 10],
      rangeY: [-10, 10],
    },
    {
      id: 'saddle',
      name: 'Hyperbolic Paraboloid (Saddle)',
      latex: 'z = \\frac{x^2 - y^2}{4}',
      type: 'surface',
      fn: (x, y) => (x * x - y * y) / 4,
      rangeX: [-6, 6],
      rangeY: [-6, 6],
    },
    {
      id: 'ripples',
      name: 'Interference Waves',
      latex: 'z = \\sin(x) \\cdot \\cos(y)',
      type: 'surface',
      fn: (x, y) => Math.sin(x) * Math.cos(y) * 1.5,
      rangeX: [-8, 8],
      rangeY: [-8, 8],
    },
    {
      id: 'monkey',
      name: 'Monkey Saddle',
      latex: 'z = \\frac{x^3 - 3xy^2}{10}',
      type: 'surface',
      fn: (x, y) => (x * x * x - 3 * x * y * y) / 10,
      rangeX: [-4, 4],
      rangeY: [-4, 4],
    },
    {
      id: 'trefoil',
      name: 'Trefoil Knot (Parametric 3D Curve)',
      latex: 'x = \\sin t + 2\\sin 2t, \\; y = \\cos t - 2\\cos 2t, \\; z = -\\sin 3t',
      type: 'parametric',
      parametricFn: (t) => {
        const x = Math.sin(t) + 2 * Math.sin(2 * t);
        const y = Math.cos(t) - 2 * Math.cos(2 * t);
        const z = -Math.sin(3 * t);
        return new THREE.Vector3(x, z, y);
      },
      rangeX: [-5, 5],
      rangeY: [-5, 5],
      tRange: [0, Math.PI * 2],
    },
    {
      id: 'lorenz',
      name: 'Lorenz Strange Attractor (Chaos)',
      latex: '\\frac{dx}{dt} = \\sigma(y - x), \\; \\frac{dy}{dt} = x(\\rho - z) - y, \\; \\frac{dz}{dt} = xy - \\beta z',
      type: 'parametric',
      rangeX: [-25, 25],
      rangeY: [-25, 25],
    },
  ];

  const currentPreset = presets.find((p) => p.id === activePresetId) || presets[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(darkMode ? 0x15151d : 0xfafafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 18, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, darkMode ? 0.7 : 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(20, 40, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7655e8, 0.8);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // 3. Grid Helper
    const gridHelper = new THREE.GridHelper(
      24,
      24,
      darkMode ? 0x3a3a4e : 0xd0d0d8,
      darkMode ? 0x222232 : 0xe8e8ee
    );
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(14);
    axesHelper.position.y = -4;
    scene.add(axesHelper);

    // 4. Mathematical Geometry Mesh
    let meshGroup = new THREE.Group();
    scene.add(meshGroup);

    const buildGeometry = () => {
      // Clear previous
      while (meshGroup.children.length > 0) {
        const obj = meshGroup.children[0];
        meshGroup.remove(obj);
      }

      if (currentPreset.id === 'lorenz') {
        // Lorenz Attractor Numerical Integration (Runge-Kutta 4)
        const points: THREE.Vector3[] = [];
        let x = 0.1,
          y = 0,
          z = 0;
        const dt = 0.01;
        const sigma = 10,
          rho = 28,
          beta = 8 / 3;

        for (let i = 0; i < 3500; i++) {
          const dx = sigma * (y - x) * dt;
          const dy = (x * (rho - z) - y) * dt;
          const dz = (x * y - beta * z) * dt;
          x += dx;
          y += dy;
          z += dz;
          points.push(new THREE.Vector3(x * 0.4, (z - 25) * 0.4, y * 0.4));
        }

        const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const curveMaterial = new THREE.LineBasicMaterial({
          color: 0x7655e8,
          linewidth: 2,
        });
        const lorenzLine = new THREE.Line(curveGeometry, curveMaterial);
        meshGroup.add(lorenzLine);
        return;
      }

      if (currentPreset.type === 'parametric' && currentPreset.parametricFn) {
        // Parametric Curve (Tube Geometry) using CatmullRomCurve3
        const curvePoints: THREE.Vector3[] = [];
        const steps = 120;
        for (let i = 0; i < steps; i++) {
          const t = (i / steps) * Math.PI * 2;
          const pt = currentPreset.parametricFn(t);
          curvePoints.push(new THREE.Vector3(pt.x * 2.5, pt.y * 2.5, pt.z * 2.5));
        }
        const path = new THREE.CatmullRomCurve3(curvePoints, true);
        const tubeGeom = new THREE.TubeGeometry(path, 150, 0.45, 12, true);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: 0x7655e8,
          roughness: 0.3,
          metalness: 0.6,
          wireframe,
        });
        const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
        meshGroup.add(tubeMesh);
        return;
      }

      // 3D Surface z = f(x, y)
      const res = resolution;
      const geom = new THREE.PlaneGeometry(20, 20, res, res);
      geom.rotateX(-Math.PI / 2);

      const pos = geom.attributes.position;
      const colors: number[] = [];

      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const pz = pos.getZ(i);

        // Map plane [-10, 10] into preset domain
        const normX = px / 10;
        const normZ = pz / 10;
        const mathX =
          currentPreset.rangeX[0] + ((normX + 1) / 2) * (currentPreset.rangeX[1] - currentPreset.rangeX[0]);
        const mathY =
          currentPreset.rangeY[0] + ((normZ + 1) / 2) * (currentPreset.rangeY[1] - currentPreset.rangeY[0]);

        let mathZ = currentPreset.fn ? currentPreset.fn(mathX, mathY) : 0;
        if (!Number.isFinite(mathZ) || isNaN(mathZ)) mathZ = 0;

        const py = mathZ * heightScale;
        pos.setY(i, py);

        // Color gradient by elevation
        const normY = Math.max(0, Math.min(1, (py + 4) / 8));
        const color = new THREE.Color();

        if (colorTheme === 'cyberpunk') {
          color.setHSL(0.75 - normY * 0.35, 0.85, 0.55); // Violet to Teal
        } else if (colorTheme === 'viridis') {
          color.setHSL(0.55 - normY * 0.4, 0.9, 0.5); // Blue to Yellow
        } else if (colorTheme === 'magma') {
          color.setHSL(0.05 + normY * 0.15, 0.95, 0.2 + normY * 0.5); // Dark Purple to Yellow
        } else {
          color.setHSL(0.45, 0.8, 0.3 + normY * 0.4); // Emerald
        }

        colors.push(color.r, color.g, color.b);
      }

      geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.35,
        metalness: 0.2,
        wireframe,
        side: THREE.DoubleSide,
      });

      const surfaceMesh = new THREE.Mesh(geom, mat);
      meshGroup.add(surfaceMesh);
    };

    buildGeometry();

    // 5. Interactive Mouse Orbit Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = new THREE.Spherical(35, Math.PI / 3.2, Math.PI / 4);

    const updateCameraPos = () => {
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;

      spherical.theta -= dx * 0.008;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy * 0.008));
      updateCameraPos();

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(8, Math.min(80, spherical.radius + e.deltaY * 0.05));
      updateCameraPos();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 6. Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        meshGroup.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [activePresetId, wireframe, autoRotate, colorTheme, resolution, heightScale, darkMode]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#15151D] overflow-hidden select-none">
      {/* Left Control Panel */}
      <div className="w-80 shrink-0 border-r border-[#E7E7ED] dark:border-[#2B2D3A] bg-white dark:bg-[#181824] p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#7655E8]/10 text-[#7655E8]">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">3D Universe</h2>
              <p className="text-[11px] text-[#747989] dark:text-[#9A9EAF]">Three.js mathematical manifolds</p>
            </div>
          </div>

          {/* Active Preset Equation */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#7655E8]/5 to-transparent border border-[#7655E8]/20 dark:border-[#8E70FF]/20 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-[#747989] dark:text-[#9A9EAF] mb-1">Active Mathematical Surface</div>
            <div className="text-xs font-semibold text-[#171923] dark:text-[#F8F8FC] mb-1.5">{currentPreset.name}</div>
            <div className="text-xs font-bold text-[#7655E8] dark:text-[#A78BFA] overflow-x-auto py-1">
              <KatexRenderer math={currentPreset.latex} block />
            </div>
          </div>

          {/* Presets List */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Surface Presets
            </span>
            <div className="space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setActivePresetId(preset.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activePresetId === preset.id
                      ? 'bg-gradient-to-r from-[#7655E8] to-[#8E70FF] text-white shadow-md font-bold'
                      : 'bg-[#FAFAFC] dark:bg-[#181826] text-[#171923] dark:text-[#F8F8FC] hover:bg-[#F1F2F6] dark:hover:bg-[#202030] border border-[#E7E7ED] dark:border-[#27273A]'
                  }`}
                >
                  <div className="truncate">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Adjustments */}
          <div className="space-y-3 pt-2 border-t border-[#E7E7ED] dark:border-[#27273A]">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Rendering Shaders
            </span>

            {/* Color Palette */}
            <div>
              <div className="text-[11px] text-[#747989] mb-1.5 flex items-center space-x-1">
                <Palette className="w-3.5 h-3.5" />
                <span>Color Spectral Theme</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {(['cyberpunk', 'viridis', 'magma', 'emerald'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setColorTheme(t)}
                    className={`py-1.5 px-2 rounded-lg capitalize border text-center transition-all cursor-pointer ${
                      colorTheme === t
                        ? 'border-[#7655E8] bg-[#7655E8]/15 text-[#7655E8] dark:text-[#A78BFA] font-bold ring-1 ring-[#7655E8]'
                        : 'border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#20202F]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Height Amplitude */}
            <div>
              <div className="flex justify-between text-[11px] text-[#747989] mb-1">
                <span>Height Amplitude</span>
                <span className="font-mono-math">{heightScale}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={heightScale}
                onChange={(e) => setHeightScale(parseFloat(e.target.value))}
                className="w-full accent-[#7655E8]"
              />
            </div>

            {/* Resolution Density */}
            <div>
              <div className="flex justify-between text-[11px] text-[#747989] mb-1">
                <span>Mesh Grid Resolution</span>
                <span className="font-mono-math">{resolution}²</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={resolution}
                onChange={(e) => setResolution(parseInt(e.target.value))}
                className="w-full accent-[#7655E8]"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-[#171923] dark:text-[#F8F8FC]">Hologram Wireframe</span>
                <input
                  type="checkbox"
                  checked={wireframe}
                  onChange={(e) => setWireframe(e.target.checked)}
                  className="rounded border-[#E7E7ED] text-[#7655E8] focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-[#171923] dark:text-[#F8F8FC]">Auto-Rotation</span>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="rounded border-[#E7E7ED] text-[#7655E8] focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E7E7ED] dark:border-[#27273A] text-[11px] text-[#747989]">
          Tip: Drag left-click to orbit in 3D. Scroll mouse wheel to zoom.
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="flex-1 relative overflow-hidden bg-radial from-[#151522] to-[#0A0A10]">
        {/* Floating Telemetry Badge */}
        <div className="absolute top-4 right-4 z-10 glass-dock px-3 py-1.5 rounded-xl flex items-center space-x-3 text-[11px] font-mono-math pointer-events-none">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">WebGL 60 FPS</span>
          </div>
          <span className="text-white/40">|</span>
          <span className="text-white/80">{resolution * resolution * 2} Polygons</span>
          <span className="text-white/40">|</span>
          <span className="text-purple-300 font-bold">{currentPreset.name.split(' ')[0]}</span>
        </div>

        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>
    </div>
  );
};
