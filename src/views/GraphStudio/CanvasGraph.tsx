import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ExpressionItem, GraphViewport } from '../../types';
import { 
  compileSafeFunction, 
  numericalDerivative, 
  numericalSecondDerivative, 
  numericalIntegral, 
  findRootsInRange 
} from '../../utils/mathParser';

interface CanvasGraphProps {
  expressions: ExpressionItem[];
  viewport: GraphViewport;
  onViewportChange: (viewport: GraphViewport) => void;
  scope: Record<string, number>;
  selectedExpressionId?: string;
  onSelectExpression?: (id: string) => void;
  darkMode: boolean;
  highContrast: boolean;
  scanlineX?: number | null; // For audio sonification visualization
  showTangentInspector?: boolean;
  onToggleTangentInspector?: () => void;
}

export const CanvasGraph: React.FC<CanvasGraphProps> = ({
  expressions,
  viewport,
  onViewportChange,
  scope,
  selectedExpressionId,
  onSelectExpression,
  darkMode,
  highContrast,
  scanlineX,
  showTangentInspector = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [pinnedTangent, setPinnedTangent] = useState<{ x: number; fnId: string } | null>(null);

  // Convert mathematical coordinates to canvas pixel coordinates
  const mathToPixel = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const px = ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * width;
      const py = height - ((y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * height;
      return { px, py };
    },
    [viewport]
  );

  // Convert canvas pixel coordinates to mathematical coordinates
  const pixelToMath = useCallback(
    (px: number, py: number, width: number, height: number) => {
      const x = viewport.xMin + (px / width) * (viewport.xMax - viewport.xMin);
      const y = viewport.yMin + ((height - py) / height) * (viewport.yMax - viewport.yMin);
      return { x, y };
    },
    [viewport]
  );

  // Calculate grid tick intervals based on zoom (smaller, tighter boxes)
  const calculateTickInterval = (range: number) => {
    // Tighter spacing so boxes are compact and clean
    const rawInterval = range / 12;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
    const normalized = rawInterval / magnitude;

    if (normalized < 1.5) return magnitude;
    if (normalized < 3.5) return 2 * magnitude;
    if (normalized < 7.5) return 5 * magnitude;
    return 10 * magnitude;
  };

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Palette tokens
    const bgColor = darkMode ? '#15151D' : '#FAFAFC';
    const gridMajorColor = darkMode ? (highContrast ? '#3F3F56' : '#262638') : (highContrast ? '#D0D0DC' : '#E6E6ED');
    const gridMinorColor = darkMode ? (highContrast ? '#242436' : '#1C1C28') : (highContrast ? '#EAEAF2' : '#F2F2F7');
    const axisColor = darkMode ? (highContrast ? '#FFFFFF' : '#72778F') : (highContrast ? '#000000' : '#888D9F');
    const axisGlow = darkMode ? 'rgba(118, 85, 232, 0.15)' : 'rgba(118, 85, 232, 0.08)';
    const textColor = darkMode ? '#9A9EB0' : '#747989';

    // Clear background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const xRange = viewport.xMax - viewport.xMin;
    const yRange = viewport.yMax - viewport.yMin;
    const majorX = calculateTickInterval(xRange);
    const majorY = calculateTickInterval(yRange);
    const minorX = majorX / 5; // 5 smaller sub-boxes per major grid box
    const minorY = majorY / 5;

    // 1. Draw Fine Minor Sub-Grid Lines (Compact mathematical graph boxes)
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = gridMinorColor;
    ctx.beginPath();

    const firstMinorX = Math.floor(viewport.xMin / minorX) * minorX;
    for (let x = firstMinorX; x <= viewport.xMax; x += minorX) {
      const { px } = mathToPixel(x, 0, width, height);
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
    }

    const firstMinorY = Math.floor(viewport.yMin / minorY) * minorY;
    for (let y = firstMinorY; y <= viewport.yMax; y += minorY) {
      const { py } = mathToPixel(0, y, width, height);
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
    }
    ctx.stroke();

    // 2. Draw Major Grid Lines
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = gridMajorColor;
    ctx.font = '10px JetBrains Mono, Inter, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Major Vertical lines
    const firstMajorX = Math.floor(viewport.xMin / majorX) * majorX;
    for (let x = firstMajorX; x <= viewport.xMax; x += majorX) {
      const { px } = mathToPixel(x, 0, width, height);
      const isZero = Math.abs(x) < 1e-6;

      if (!isZero) {
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();

        const { py: zeroY } = mathToPixel(0, 0, width, height);
        const textY = Math.max(14, Math.min(height - 22, zeroY + 6));
        ctx.fillStyle = textColor;
        ctx.fillText(Number(x.toFixed(4)).toString(), px, textY);
      }
    }

    // Major Horizontal lines
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const firstMajorY = Math.floor(viewport.yMin / majorY) * majorY;
    for (let y = firstMajorY; y <= viewport.yMax; y += majorY) {
      const { py } = mathToPixel(0, y, width, height);
      const isZero = Math.abs(y) < 1e-6;

      if (!isZero) {
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();

        const { px: zeroX } = mathToPixel(0, 0, width, height);
        const textX = Math.max(26, Math.min(width - 8, zeroX - 6));
        ctx.fillStyle = textColor;
        ctx.fillText(Number(y.toFixed(4)).toString(), textX, py);
      }
    }

    // 3. Draw Primary Origin Axes (X-axis and Y-axis with Arrowheads)
    const origin = mathToPixel(0, 0, width, height);

    // X-Axis
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = highContrast ? 2.5 : 1.8;
    ctx.beginPath();
    ctx.moveTo(0, origin.py);
    ctx.lineTo(width, origin.py);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(origin.px, 0);
    ctx.lineTo(origin.px, height);
    ctx.stroke();

    // Axis Arrows
    const arrowSize = 6;
    // +X arrow
    ctx.fillStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(width - 2, origin.py);
    ctx.lineTo(width - 2 - arrowSize * 1.5, origin.py - arrowSize);
    ctx.lineTo(width - 2 - arrowSize * 1.5, origin.py + arrowSize);
    ctx.closePath();
    ctx.fill();

    // +Y arrow
    ctx.beginPath();
    ctx.moveTo(origin.px, 2);
    ctx.lineTo(origin.px - arrowSize, 2 + arrowSize * 1.5);
    ctx.lineTo(origin.px + arrowSize, 2 + arrowSize * 1.5);
    ctx.closePath();
    ctx.fill();

    // Center Origin (0,0) Badge with Glowing Ring
    if (origin.px >= 0 && origin.px <= width && origin.py >= 0 && origin.py <= height) {
      // Outer subtle halo
      ctx.beginPath();
      ctx.arc(origin.px, origin.py, 12, 0, Math.PI * 2);
      ctx.fillStyle = axisGlow;
      ctx.fill();

      // Middle ring
      ctx.beginPath();
      ctx.arc(origin.px, origin.py, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#7655E8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(origin.px, origin.py, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#7655E8';
      ctx.fill();

      // Origin text
      ctx.fillStyle = textColor;
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('(0,0)', origin.px - 8, origin.py + 10);
    }

    // 4. Plot Mathematical Expressions with Smooth Anti-Aliasing and Subtle Glow
    expressions.forEach((item) => {
      if (!item.visible || item.type !== 'function') return;

      const compiled = compileSafeFunction(item.raw);
      if (compiled.hasError) return;

      const isSelected = selectedExpressionId === item.id;
      const strokeColor = item.color;

      // 4a. Definite Integral Shading if enabled
      if (item.showIntegral) {
        const [a, b] = item.integralRange || [-2, 2];
        const intA = Math.max(viewport.xMin, Math.min(viewport.xMax, Math.min(a, b)));
        const intB = Math.max(viewport.xMin, Math.min(viewport.xMax, Math.max(a, b)));

        const intPoints: { px: number; py: number }[] = [];
        const intSteps = 200;
        const dx = (intB - intA) / intSteps;

        for (let i = 0; i <= intSteps; i++) {
          const x = intA + i * dx;
          const y = compiled.evaluate(x, scope);
          if (Number.isFinite(y)) {
            intPoints.push(mathToPixel(x, y, width, height));
          }
        }

        if (intPoints.length > 1) {
          ctx.beginPath();
          const pStart = mathToPixel(intA, 0, width, height);
          ctx.moveTo(pStart.px, pStart.py);
          intPoints.forEach(p => ctx.lineTo(p.px, p.py));
          const pEnd = mathToPixel(intB, 0, width, height);
          ctx.lineTo(pEnd.px, pEnd.py);
          ctx.closePath();

          ctx.fillStyle = `${strokeColor}22`;
          ctx.fill();

          const area = numericalIntegral(compiled.evaluate, a, b, scope);
          const midX = (a + b) / 2;
          const midY = compiled.evaluate(midX, scope) / 2;
          const labelPos = mathToPixel(midX, isNaN(midY) ? 0 : midY, width, height);

          ctx.fillStyle = darkMode ? '#FFFFFF' : '#171923';
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`∫ = ${area.toFixed(3)}`, labelPos.px, labelPos.py);
        }
      }

      // 4b. Derivative Curve Overlay in dashed line if enabled
      if (item.showDerivative) {
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = `${strokeColor}99`;
        ctx.lineWidth = 1.5;

        let dStarted = false;
        for (let px = 0; px <= width; px += 2) {
          const x = viewport.xMin + (px / width) * xRange;
          const dy = numericalDerivative(compiled.evaluate, x, scope);
          if (Number.isFinite(dy)) {
            const { py } = mathToPixel(x, dy, width, height);
            if (!dStarted) {
              ctx.moveTo(px, py);
              dStarted = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            dStarted = false;
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4c. Main Function Curve (Ultra-Dense Smooth Sampling & Glow)
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Subtle luminous glow for selected or active curve
      if (isSelected) {
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 8;
      }

      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isSelected ? (highContrast ? 3.5 : 3.0) : (highContrast ? 2.5 : 2.0);

      const numSamples = Math.min(width * 2.5, 3000);
      let isDrawing = false;
      let prevY = 0;

      for (let i = 0; i <= numSamples; i++) {
        const x = viewport.xMin + (i / numSamples) * xRange;
        const y = compiled.evaluate(x, scope);

        if (!Number.isFinite(y) || isNaN(y)) {
          isDrawing = false;
          continue;
        }

        const { px, py } = mathToPixel(x, y, width, height);

        // Filter asymptotic jumps
        if (isDrawing && Math.abs(y - prevY) > yRange * 3) {
          isDrawing = false;
        }

        if (!isDrawing) {
          ctx.moveTo(px, py);
          isDrawing = true;
        } else {
          ctx.lineTo(px, py);
        }
        prevY = y;
      }
      ctx.stroke();
      ctx.restore();

      // 4d. Root Markers (x-intercepts)
      const roots = findRootsInRange(compiled.evaluate, viewport.xMin, viewport.xMax, scope);
      roots.forEach((root) => {
        const { px, py } = mathToPixel(root, 0, width, height);
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    });

    // 5. Audio Sonification Scanline (if active)
    if (typeof scanlineX === 'number' && scanlineX >= viewport.xMin && scanlineX <= viewport.xMax) {
      const { px } = mathToPixel(scanlineX, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = '#17A890';
      ctx.lineWidth = 2;
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, 20, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#17A890';
      ctx.fill();
    }

    // 6. Live Tangent Line & Slope Inspection
    const inspectTarget = pinnedTangent || (hoverCoord ? { x: hoverCoord.x, fnId: selectedExpressionId || '' } : null);

    if (showTangentInspector && inspectTarget) {
      const activeFn = expressions.find(e => e.id === inspectTarget.fnId && e.visible && e.type === 'function')
        || expressions.find(e => e.visible && e.type === 'function');

      if (activeFn) {
        const compiled = compileSafeFunction(activeFn.raw);
        if (!compiled.hasError) {
          const x0 = inspectTarget.x;
          const y0 = compiled.evaluate(x0, scope);

          if (Number.isFinite(y0)) {
            const slope = numericalDerivative(compiled.evaluate, x0, scope);
            const secondDeriv = numericalSecondDerivative(compiled.evaluate, x0, scope);
            const p0 = mathToPixel(x0, y0, width, height);

            if (Number.isFinite(slope)) {
              // 6a. Extended Tangent Line Segment: y - y0 = m*(x - x0)
              const span = xRange * 0.22;
              const xLeft = x0 - span;
              const yLeft = y0 - slope * span;
              const xRight = x0 + span;
              const yRight = y0 + slope * span;

              const pLeft = mathToPixel(xLeft, yLeft, width, height);
              const pRight = mathToPixel(xRight, yRight, width, height);

              // Draw Tangent line
              ctx.beginPath();
              ctx.strokeStyle = '#17A890';
              ctx.lineWidth = 2;
              ctx.moveTo(pLeft.px, pLeft.py);
              ctx.lineTo(pRight.px, pRight.py);
              ctx.stroke();

              // Draw Slope Triangle (Rise / Run)
              const runMath = span * 0.5;
              const riseMath = slope * runMath;
              const pRun = mathToPixel(x0 + runMath, y0, width, height);
              const pRise = mathToPixel(x0 + runMath, y0 + riseMath, width, height);

              ctx.beginPath();
              ctx.fillStyle = 'rgba(23, 168, 144, 0.12)';
              ctx.moveTo(p0.px, p0.py);
              ctx.lineTo(pRun.px, pRun.py);
              ctx.lineTo(pRise.px, pRise.py);
              ctx.closePath();
              ctx.fill();

              // Dashed slope triangle edges
              ctx.beginPath();
              ctx.setLineDash([2, 2]);
              ctx.strokeStyle = '#17A890aa';
              ctx.lineWidth = 1;
              ctx.moveTo(p0.px, p0.py);
              ctx.lineTo(pRun.px, pRun.py);
              ctx.lineTo(pRise.px, pRise.py);
              ctx.stroke();
              ctx.setLineDash([]);

              // Contact point pulsing ring
              ctx.beginPath();
              ctx.arc(p0.px, p0.py, 7, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(23, 168, 144, 0.25)';
              ctx.fill();

              ctx.beginPath();
              ctx.arc(p0.px, p0.py, 4, 0, Math.PI * 2);
              ctx.fillStyle = '#17A890';
              ctx.fill();
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // 6b. Rich Interactive Slope & Tangent HUD Card
              const angleDeg = (Math.atan(slope) * 180) / Math.PI;
              const concavity = secondDeriv > 0.001 
                ? 'Concave Up ∪ (Local Min)' 
                : secondDeriv < -0.001 
                ? 'Concave Down ∩ (Local Max)' 
                : 'Inflection Point';

              const hudX = Math.min(width - 240, Math.max(16, p0.px + 16));
              const hudY = Math.min(height - 110, Math.max(16, p0.py - 90));

              ctx.fillStyle = darkMode ? '#1E1E2BE8' : '#FFFFFFE8';
              ctx.strokeStyle = darkMode ? '#3A3A4E' : '#DCDCE5';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.roundRect(hudX, hudY, 220, 80, 10);
              ctx.fill();
              ctx.stroke();

              // Slope Header
              ctx.font = 'bold 11px JetBrains Mono, monospace';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              ctx.fillStyle = '#17A890';
              ctx.fillText(`Slope m = ${slope.toFixed(4)}`, hudX + 10, hudY + 8);

              // Angle & Point
              ctx.font = '10px JetBrains Mono, monospace';
              ctx.fillStyle = darkMode ? '#E2E4EB' : '#171923';
              ctx.fillText(`Point: (${x0.toFixed(2)}, ${y0.toFixed(2)}) | θ = ${angleDeg.toFixed(1)}°`, hudX + 10, hudY + 26);

              // Tangent Line Equation
              const interceptC = y0 - slope * x0;
              const signC = interceptC >= 0 ? '+' : '-';
              ctx.fillStyle = '#7655E8';
              ctx.fillText(`Tangent: y = ${slope.toFixed(2)}x ${signC} ${Math.abs(interceptC).toFixed(2)}`, hudX + 10, hudY + 44);

              // Concavity / 2nd Derivative
              ctx.fillStyle = textColor;
              ctx.fillText(`f''(x): ${secondDeriv.toFixed(2)} | ${concavity}`, hudX + 10, hudY + 62);
            }
          }
        }
      }
    }

    // 7. Crosshair Tracking Lines on Hover
    if (hoverCoord && !isDragging) {
      const { canvasX, canvasY } = hoverCoord;
      ctx.beginPath();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)';
      ctx.lineWidth = 1;
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    expressions,
    viewport,
    scope,
    selectedExpressionId,
    darkMode,
    highContrast,
    scanlineX,
    hoverCoord,
    pinnedTangent,
    showTangentInspector,
    mathToPixel,
  ]);

  // Handle Resize to High-DPI canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse pan and drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mousePx = e.clientX - rect.left;
    const mousePy = e.clientY - rect.top;

    const mathCoord = pixelToMath(mousePx, mousePy, rect.width, rect.height);
    setHoverCoord({
      x: mathCoord.x,
      y: mathCoord.y,
      canvasX: mousePx,
      canvasY: mousePy,
    });

    if (isDragging) {
      const dxPx = e.clientX - dragStart.x;
      const dyPx = e.clientY - dragStart.y;

      const xSpan = viewport.xMax - viewport.xMin;
      const ySpan = viewport.yMax - viewport.yMin;

      const dxMath = (dxPx / rect.width) * xSpan;
      const dyMath = (dyPx / rect.height) * ySpan;

      onViewportChange({
        xMin: viewport.xMin - dxMath,
        xMax: viewport.xMax - dxMath,
        yMin: viewport.yMin + dyMath,
        yMax: viewport.yMax + dyMath,
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoverCoord(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mousePx = e.clientX - rect.left;
    const mousePy = e.clientY - rect.top;
    const mathCoord = pixelToMath(mousePx, mousePy, rect.width, rect.height);

    if (pinnedTangent) {
      setPinnedTangent(null); // unpin on second click
    } else {
      const activeFn = expressions.find(item => item.id === selectedExpressionId && item.visible && item.type === 'function')
        || expressions.find(item => item.visible && item.type === 'function');
      if (activeFn) {
        setPinnedTangent({ x: mathCoord.x, fnId: activeFn.id });
      }
    }
  };

  // Zoom on wheel
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const mousePx = e.clientX - rect.left;
    const mousePy = e.clientY - rect.top;
    const anchor = pixelToMath(mousePx, mousePy, rect.width, rect.height);

    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;

    const newXMin = anchor.x - (anchor.x - viewport.xMin) * zoomFactor;
    const newXMax = anchor.x + (viewport.xMax - anchor.x) * zoomFactor;
    const newYMin = anchor.y - (anchor.y - viewport.yMin) * zoomFactor;
    const newYMax = anchor.y + (viewport.yMax - anchor.y) * zoomFactor;

    onViewportChange({
      xMin: newXMin,
      xMax: newXMax,
      yMin: newYMin,
      yMax: newYMax,
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-transparent">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onWheel={handleWheel}
        className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
      />
    </div>
  );
};
