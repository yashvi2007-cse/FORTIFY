import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Compass, 
  MousePointer, 
  Circle, 
  Minus, 
  Slash, 
  Hexagon, 
  RotateCcw, 
  Download, 
  Trash2, 
  Sparkles, 
  Maximize2,
  Grid,
  Info
} from 'lucide-react';

interface GeometryViewProps {
  darkMode: boolean;
}

type GeometryTool = 'select' | 'point' | 'segment' | 'line' | 'circle' | 'polygon' | 'midpoint' | 'angle';

interface GeoPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  color?: string;
}

interface GeoSegment {
  id: string;
  p1Id: string;
  p2Id: string;
  color?: string;
}

interface GeoLine {
  id: string;
  p1Id: string;
  p2Id: string;
}

interface GeoCircle {
  id: string;
  centerId: string;
  radiusPointId: string;
  color?: string;
}

interface GeoPolygon {
  id: string;
  pointIds: string[];
  color?: string;
}

export const GeometryView: React.FC<GeometryViewProps> = ({ darkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Tool
  const [activeTool, setActiveTool] = useState<GeometryTool>('select');
  const [snapGrid, setSnapGrid] = useState<boolean>(true);

  // Geometric Entities
  const [points, setPoints] = useState<GeoPoint[]>([
    { id: 'pA', name: 'A', x: 200, y: 350, color: '#7655E8' },
    { id: 'pB', name: 'B', x: 450, y: 350, color: '#7655E8' },
    { id: 'pC', name: 'C', x: 200, y: 150, color: '#17A890' },
  ]);

  const [segments, setSegments] = useState<GeoSegment[]>([
    { id: 's1', p1Id: 'pA', p2Id: 'pB', color: '#7655E8' },
    { id: 's2', p1Id: 'pA', p2Id: 'pC', color: '#17A890' },
    { id: 's3', p1Id: 'pB', p2Id: 'pC', color: '#EC4899' },
  ]);

  const [circles, setCircles] = useState<GeoCircle[]>([
    { id: 'c1', centerId: 'pA', radiusPointId: 'pC', color: 'rgba(118, 85, 232, 0.25)' },
  ]);

  const [polygons, setPolygons] = useState<GeoPolygon[]>([
    { id: 'poly1', pointIds: ['pA', 'pB', 'pC'], color: 'rgba(23, 168, 144, 0.12)' },
  ]);

  // Construction State
  const [pendingPointId, setPendingPointId] = useState<string | null>(null);
  const [polygonDraftPointIds, setPolygonDraftPointIds] = useState<string[]>([]);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);

  // Selected Preset
  const [activePreset, setActivePreset] = useState<string>('pythagoras');

  // Load Presets
  const loadPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    setPendingPointId(null);
    setPolygonDraftPointIds([]);

    if (presetKey === 'pythagoras') {
      setPoints([
        { id: 'pA', name: 'A', x: 220, y: 360, color: '#7655E8' },
        { id: 'pB', name: 'B', x: 460, y: 360, color: '#7655E8' },
        { id: 'pC', name: 'C', x: 220, y: 180, color: '#17A890' },
      ]);
      setSegments([
        { id: 's1', p1Id: 'pA', p2Id: 'pB', color: '#7655E8' },
        { id: 's2', p1Id: 'pA', p2Id: 'pC', color: '#17A890' },
        { id: 's3', p1Id: 'pB', p2Id: 'pC', color: '#EC4899' },
      ]);
      setCircles([]);
      setPolygons([{ id: 'poly1', pointIds: ['pA', 'pB', 'pC'], color: 'rgba(118, 85, 232, 0.15)' }]);
    } else if (presetKey === 'circle-tangent') {
      setPoints([
        { id: 'pO', name: 'O (Center)', x: 350, y: 260, color: '#7655E8' },
        { id: 'pP', name: 'P (Radius)', x: 500, y: 260, color: '#17A890' },
        { id: 'pT1', name: 'T₁', x: 500, y: 120, color: '#EC4899' },
        { id: 'pT2', name: 'T₂', x: 500, y: 400, color: '#EC4899' },
      ]);
      setCircles([{ id: 'c1', centerId: 'pO', radiusPointId: 'pP', color: 'rgba(118, 85, 232, 0.2)' }]);
      setSegments([
        { id: 's1', p1Id: 'pO', p2Id: 'pP', color: '#7655E8' },
        { id: 's2', p1Id: 'pT1', p2Id: 'pT2', color: '#17A890' },
      ]);
      setPolygons([]);
    } else if (presetKey === 'inscribed-angle') {
      setPoints([
        { id: 'pO', name: 'O', x: 350, y: 260, color: '#7655E8' },
        { id: 'pA', name: 'A', x: 200, y: 260, color: '#17A890' },
        { id: 'pB', name: 'B', x: 500, y: 260, color: '#17A890' },
        { id: 'pC', name: 'C', x: 350, y: 110, color: '#EC4899' },
      ]);
      setCircles([{ id: 'c1', centerId: 'pO', radiusPointId: 'pA', color: 'rgba(118, 85, 232, 0.15)' }]);
      setSegments([
        { id: 's1', p1Id: 'pA', p2Id: 'pC', color: '#17A890' },
        { id: 's2', p1Id: 'pC', p2Id: 'pB', color: '#17A890' },
        { id: 's3', p1Id: 'pA', p2Id: 'pB', color: '#7655E8' },
      ]);
      setPolygons([]);
    }
  };

  // Canvas redraw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = darkMode ? '#0C0C14' : '#FAFAFC';
    ctx.fillRect(0, 0, width, height);

    // 1. Grid
    const gridSize = 30;
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Map point lookup
    const pMap = new Map<string, GeoPoint>();
    points.forEach((p) => pMap.set(p.id, p));

    // 2. Polygons
    polygons.forEach((poly) => {
      if (poly.pointIds.length < 3) return;
      ctx.beginPath();
      poly.pointIds.forEach((pid, idx) => {
        const pt = pMap.get(pid);
        if (!pt) return;
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = poly.color || 'rgba(118, 85, 232, 0.15)';
      ctx.fill();
    });

    // 3. Circles
    circles.forEach((circ) => {
      const center = pMap.get(circ.centerId);
      const radPt = pMap.get(circ.radiusPointId);
      if (!center || !radPt) return;

      const r = Math.hypot(radPt.x - center.x, radPt.y - center.y);
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
      ctx.fillStyle = circ.color || 'rgba(118, 85, 232, 0.12)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#7655E8';
      ctx.stroke();
    });

    // 4. Segments
    segments.forEach((seg) => {
      const p1 = pMap.get(seg.p1Id);
      const p2 = pMap.get(seg.p2Id);
      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = seg.color || '#7655E8';
      ctx.stroke();

      // Show live segment length label
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) / 30; // in grid units

      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = darkMode ? '#9A9EAF' : '#747989';
      ctx.textAlign = 'center';
      ctx.fillText(`${len.toFixed(1)}u`, midX, midY - 6);
    });

    // 5. Points
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = p.color || '#7655E8';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = darkMode ? '#F8F8FC' : '#171923';
      ctx.textAlign = 'left';
      ctx.fillText(p.name, p.x + 10, p.y - 6);
    });

    // If point is pending in segment/circle tool
    if (pendingPointId) {
      const pt = pMap.get(pendingPointId);
      if (pt) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#17A890';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [points, segments, circles, polygons, pendingPointId, darkMode]);

  // Click & Drag Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (snapGrid) {
      x = Math.round(x / 15) * 15;
      y = Math.round(y / 15) * 15;
    }
    return { x, y };
  };

  const findNearbyPoint = (x: number, y: number, radius = 18): GeoPoint | null => {
    for (const p of points) {
      if (Math.hypot(p.x - x, p.y - y) <= radius) {
        return p;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const nearby = findNearbyPoint(x, y);

    if (activeTool === 'select') {
      if (nearby) setDraggedPointId(nearby.id);
      return;
    }

    if (activeTool === 'point') {
      if (!nearby) {
        const nextLetter = String.fromCharCode(65 + points.length);
        const newPoint: GeoPoint = {
          id: `p-${Date.now()}`,
          name: nextLetter,
          x,
          y,
          color: '#7655E8',
        };
        setPoints((prev) => [...prev, newPoint]);
      }
      return;
    }

    if (activeTool === 'segment') {
      let pt = nearby;
      if (!pt) {
        // create point
        const nextLetter = String.fromCharCode(65 + points.length);
        pt = { id: `p-${Date.now()}`, name: nextLetter, x, y, color: '#7655E8' };
        setPoints((prev) => [...prev, pt!]);
      }

      if (!pendingPointId) {
        setPendingPointId(pt.id);
      } else if (pendingPointId !== pt.id) {
        setSegments((prev) => [
          ...prev,
          { id: `seg-${Date.now()}`, p1Id: pendingPointId, p2Id: pt!.id, color: '#7655E8' },
        ]);
        setPendingPointId(null);
      }
      return;
    }

    if (activeTool === 'circle') {
      let pt = nearby;
      if (!pt) {
        const nextLetter = String.fromCharCode(65 + points.length);
        pt = { id: `p-${Date.now()}`, name: nextLetter, x, y, color: '#7655E8' };
        setPoints((prev) => [...prev, pt!]);
      }

      if (!pendingPointId) {
        setPendingPointId(pt.id);
      } else if (pendingPointId !== pt.id) {
        setCircles((prev) => [
          ...prev,
          { id: `circ-${Date.now()}`, centerId: pendingPointId, radiusPointId: pt!.id },
        ]);
        setPendingPointId(null);
      }
      return;
    }

    if (activeTool === 'polygon') {
      let pt = nearby;
      if (!pt) {
        const nextLetter = String.fromCharCode(65 + points.length);
        pt = { id: `p-${Date.now()}`, name: nextLetter, x, y, color: '#7655E8' };
        setPoints((prev) => [...prev, pt!]);
      }

      if (polygonDraftPointIds.length >= 2 && polygonDraftPointIds[0] === pt.id) {
        // Close polygon!
        setPolygons((prev) => [
          ...prev,
          { id: `poly-${Date.now()}`, pointIds: [...polygonDraftPointIds], color: 'rgba(23, 168, 144, 0.15)' },
        ]);
        setPolygonDraftPointIds([]);
      } else {
        setPolygonDraftPointIds((prev) => [...prev, pt!.id]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedPointId) return;
    const { x, y } = getCanvasCoords(e);
    setPoints((prev) =>
      prev.map((p) => (p.id === draggedPointId ? { ...p, x, y } : p))
    );
  };

  const handleMouseUp = () => {
    setDraggedPointId(null);
  };

  const handleClear = () => {
    setPoints([]);
    setSegments([]);
    setCircles([]);
    setPolygons([]);
    setPendingPointId(null);
    setPolygonDraftPointIds([]);
  };

  // Live geometry calculations
  const pA = points.find((p) => p.name.startsWith('A')) || points[0];
  const pB = points.find((p) => p.name.startsWith('B')) || points[1];
  const pC = points.find((p) => p.name.startsWith('C')) || points[2];

  const distAB = pA && pB ? (Math.hypot(pB.x - pA.x, pB.y - pA.y) / 30).toFixed(2) : '0';
  const distAC = pA && pC ? (Math.hypot(pC.x - pA.x, pC.y - pA.y) / 30).toFixed(2) : '0';
  const distBC = pB && pC ? (Math.hypot(pC.x - pB.x, pC.y - pB.y) / 30).toFixed(2) : '0';

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#0C0C14] overflow-hidden select-none">
      {/* Left Geometric Inspector */}
      <div className="w-80 shrink-0 border-r border-[#E7E7ED] dark:border-[#27273A] bg-white dark:bg-[#13131E] p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5 pb-2.5 border-b border-[#E7E7ED] dark:border-[#27273A]">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-[#171923] dark:text-[#F8F8FC]">Geometry Studio</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-400 font-bold">
                  2D CONSTRUCT
                </span>
              </div>
              <p className="text-xs text-[#747989] dark:text-[#9A9EAF]">Euclidean ruler, compass & dynamic theorems</p>
            </div>
          </div>

          {/* Preset Theorems */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Classic Theorem Presets
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {[
                { id: 'pythagoras', label: 'Pythagorean Theorem', desc: 'Right triangle invariant' },
                { id: 'circle-tangent', label: 'Circle Tangent Line', desc: 'Perpendicular radius' },
                { id: 'inscribed-angle', label: 'Inscribed Angle in Circle', desc: 'Thales circle theorem' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadPreset(item.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    activePreset === item.id
                      ? 'border-[#7655E8] bg-[#7655E8]/10 text-[#7655E8] dark:text-[#A78BFA] ring-1 ring-[#7655E8]'
                      : 'border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#1C1C2C]'
                  }`}
                >
                  <div className="font-bold">{item.label}</div>
                  <div className="text-[10px] text-[#9A9EAF]">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Telemetry Measurements */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#7655E8]/5 to-transparent border border-[#7655E8]/20 dark:border-[#8E70FF]/20 space-y-2 text-xs font-mono-math">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#7655E8] dark:text-[#A78BFA]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dynamic Invariants</span>
            </div>
            <div className="space-y-1 text-[#747989]">
              <div className="flex justify-between">
                <span>Segment [AB]:</span>
                <span className="font-bold text-[#171923] dark:text-[#F8F8FC]">{distAB} units</span>
              </div>
              <div className="flex justify-between">
                <span>Segment [AC]:</span>
                <span className="font-bold text-[#171923] dark:text-[#F8F8FC]">{distAC} units</span>
              </div>
              <div className="flex justify-between">
                <span>Hypotenuse [BC]:</span>
                <span className="font-bold text-[#171923] dark:text-[#F8F8FC]">{distBC} units</span>
              </div>
              <div className="border-t border-[#E7E7ED] dark:border-[#27273A] pt-1 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                Pythagoras: a² + b² = {(parseFloat(distAB)**2 + parseFloat(distAC)**2).toFixed(1)} ≈ c² {(parseFloat(distBC)**2).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Construction Guide Note */}
          <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-[#F1F2F6] dark:bg-[#181826] text-[11px] text-[#747989] leading-relaxed">
            <Info className="w-4 h-4 shrink-0 text-[#7655E8] mt-0.5" />
            <span>Select tool, then click two points to create a segment or circle. Drag points to observe dynamic theorem invariance.</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E7E7ED] dark:border-[#27273A] flex items-center justify-between">
          <button
            onClick={() => setSnapGrid(!snapGrid)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              snapGrid 
                ? 'bg-[#17A890]/15 text-[#17A890] border-[#17A890]/30' 
                : 'text-[#747989] border-[#E7E7ED] dark:border-[#27273A]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Snap Grid</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            title="Clear all geometric objects"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Geometric Plane */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top Floating Construction Tools Palette */}
        <div className="absolute top-4 left-6 z-20 flex items-center space-x-1.5 glass-dock p-1.5 rounded-2xl shadow-xl">
          {[
            { id: 'select' as GeometryTool, label: 'Select / Move', icon: MousePointer },
            { id: 'point' as GeometryTool, label: 'Point', icon: Circle },
            { id: 'segment' as GeometryTool, label: 'Segment', icon: Minus },
            { id: 'circle' as GeometryTool, label: 'Circle', icon: Compass },
            { id: 'polygon' as GeometryTool, label: 'Polygon', icon: Hexagon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTool(item.id);
                  setPendingPointId(null);
                  setPolygonDraftPointIds([]);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7655E8] to-[#9333EA] text-white shadow-md'
                    : 'text-[#747989] hover:text-[#171923] dark:hover:text-white hover:bg-[#F1F2F6] dark:hover:bg-[#202030]'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
};
