import React, { useRef, useEffect, useState } from 'react';
import { 
  Palette, 
  Play, 
  Pause, 
  Download, 
  Sliders, 
  Sparkles, 
  RotateCw,
  Share2
} from 'lucide-react';
import { KatexRenderer } from '../../components/KatexRenderer';

interface MathArtViewProps {
  darkMode: boolean;
}

type ArtType = 'rose' | 'lissajous' | 'spiral' | 'fractal' | 'spirograph';

export const MathArtView: React.FC<MathArtViewProps> = ({ darkMode }) => {
  const [artType, setArtType] = useState<ArtType>('rose');
  const [isAnimating, setIsAnimating] = useState(true);
  const [animTime, setAnimTime] = useState(0);

  // Parameters
  const [petalsK, setPetalsK] = useState(7); // for rose r = cos(k*theta)
  const [lissajousA, setLissajousA] = useState(5);
  const [lissajousB, setLissajousB] = useState(4);
  const [colorScheme, setColorScheme] = useState<'neon' | 'sunset' | 'emerald' | 'cyberpunk'>('cyberpunk');
  const [lineWidth, setLineWidth] = useState(2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (isAnimating) {
        setAnimTime((prev) => prev + 0.015);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAnimating]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = darkMode ? '#12121A' : '#FAFAFC';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = 14;

    if (artType === 'rose') {
      // Polar Rose Curve: r = a * cos(k * theta)
      ctx.beginPath();
      const numPoints = 1400;
      const maxTheta = Math.PI * 4;
      const radiusScale = Math.min(width, height) * 0.4;

      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * maxTheta;
        const r = Math.cos(petalsK * theta + animTime) * radiusScale;
        const x = centerX + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const strokeCol = colorScheme === 'cyberpunk' ? '#8E70FF' : colorScheme === 'emerald' ? '#17A890' : '#F59E0B';
      ctx.shadowColor = strokeCol;
      ctx.strokeStyle = strokeCol;
      ctx.stroke();
    } else if (artType === 'lissajous') {
      // Lissajous 2D Figure: x = A*sin(at + delta), y = B*cos(bt)
      ctx.beginPath();
      const numPoints = 1600;
      const scale = Math.min(width, height) * 0.38;

      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 4;
        const x = centerX + Math.sin(lissajousA * t + animTime) * scale;
        const y = centerY + Math.cos(lissajousB * t) * scale;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const strokeCol = colorScheme === 'cyberpunk' ? '#EC4899' : '#10B981';
      ctx.shadowColor = strokeCol;
      ctx.strokeStyle = strokeCol;
      ctx.stroke();
    } else if (artType === 'spirograph') {
      // Hypotrochoid Spirograph
      ctx.beginPath();
      const R = Math.min(width, height) * 0.35;
      const r = R * 0.6;
      const d = R * 0.7;
      const numPoints = 2000;

      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 12;
        const x = centerX + (R - r) * Math.cos(t + animTime) + d * Math.cos(((R - r) / r) * (t + animTime));
        const y = centerY + (R - r) * Math.sin(t + animTime) - d * Math.sin(((R - r) / r) * (t + animTime));

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = '#7655E8';
      ctx.stroke();
    } else if (artType === 'fractal') {
      // Julia / Mandelbrot Set rendering on small canvas
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;
      const maxIter = 40;

      // c parameter evolves with animation
      const cr = -0.7 + Math.sin(animTime * 0.3) * 0.1;
      const ci = 0.27015 + Math.cos(animTime * 0.3) * 0.05;

      for (let px = 0; px < width; px += 2) {
        for (let py = 0; py < height; py += 2) {
          let zx = 1.5 * (px - centerX) / (0.5 * width);
          let zy = 1.2 * (py - centerY) / (0.5 * height);
          let iter = maxIter;

          while (zx * zx + zy * zy < 4 && iter > 0) {
            const tmp = zx * zx - zy * zy + cr;
            zy = 2.0 * zx * zy + ci;
            zx = tmp;
            iter--;
          }

          const idx = (py * width + px) * 4;
          const val = iter === 0 ? 0 : Math.floor((iter / maxIter) * 255);

          data[idx] = Math.floor(val * 0.6); // Red
          data[idx + 1] = Math.floor(val * 0.4); // Green
          data[idx + 2] = Math.floor(val * 0.9); // Blue
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [artType, animTime, petalsK, lissajousA, lissajousB, colorScheme, lineWidth, darkMode]);

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortify_math_art_${artType}.png`;
    a.click();
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#FAFAFC] dark:bg-[#0C0C14] overflow-hidden select-none">
      {/* Left Control Bar */}
      <div className="w-84 sm:w-92 shrink-0 border-r border-[#E7E7ED] dark:border-[#27273A] bg-white dark:bg-[#13131E] p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5 pb-2.5 border-b border-[#E7E7ED] dark:border-[#27273A]">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171923] dark:text-[#F8F8FC]">Math Art Studio</h2>
              <p className="text-[11px] text-[#747989] dark:text-[#9A9EAF]">Generative mathematical geometry</p>
            </div>
          </div>

          {/* Preset Art Selectors */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Mathematical Patterns
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'rose' as ArtType, label: 'Polar Rose' },
                { id: 'lissajous' as ArtType, label: 'Lissajous Figure' },
                { id: 'spirograph' as ArtType, label: 'Spirograph' },
                { id: 'fractal' as ArtType, label: 'Julia Fractal' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setArtType(item.id)}
                  className={`p-2.5 rounded-xl text-left font-semibold border transition-all cursor-pointer ${
                    artType === item.id
                      ? 'border-[#7655E8] dark:border-[#8E70FF] bg-[#7655E8]/10 text-[#7655E8] dark:text-[#A78BFA] shadow-xs ring-1 ring-[#7655E8]/30'
                      : 'border-[#E7E7ED] dark:border-[#27273A] text-[#747989] dark:text-[#9A9EAF] hover:bg-[#F1F2F6] dark:hover:bg-[#1C1C2C]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chromatic Palette */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Neon Palette
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              {[
                { id: 'cyberpunk', label: 'Cyberpunk' },
                { id: 'emerald', label: 'Emerald' },
                { id: 'sunset', label: 'Sunset' },
              ].map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setColorScheme(scheme.id as any)}
                  className={`py-1.5 px-2 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                    colorScheme === scheme.id
                      ? 'border-[#7655E8] bg-[#7655E8]/15 text-[#7655E8] dark:text-[#A78BFA] ring-1 ring-[#7655E8]'
                      : 'border-[#E7E7ED] dark:border-[#27273A] text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#1C1C2C]'
                  }`}
                >
                  {scheme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equation Badge */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#7655E8]/5 to-transparent border border-[#7655E8]/20 dark:border-[#8E70FF]/20 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-[#747989] dark:text-[#9A9EAF] mb-1">Underlying Formula</div>
            <div className="text-xs font-bold text-[#7655E8] dark:text-[#A78BFA]">
              {artType === 'rose' && <KatexRenderer math={`r = \\cos(${petalsK}\\theta)`} block />}
              {artType === 'lissajous' && <KatexRenderer math={`x = \\sin(${lissajousA}t + \\delta), \\; y = \\cos(${lissajousB}t)`} block />}
              {artType === 'spirograph' && <KatexRenderer math="x(t) = (R-r)\\cos t + d\\cos\\left(\\frac{R-r}{r}t\\right)" block />}
              {artType === 'fractal' && <KatexRenderer math="z_{n+1} = z_n^2 + c" block />}
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="space-y-3 pt-2 border-t border-[#E7E7ED] dark:border-[#2B2D3A]">
            <span className="text-[10px] uppercase font-bold text-[#747989] tracking-wider">
              Artistic Parameters
            </span>

            {artType === 'rose' && (
              <div>
                <div className="flex justify-between text-[11px] text-[#747989] mb-1">
                  <span>Petal Harmonic (k)</span>
                  <span className="font-mono-math">{petalsK}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={petalsK}
                  onChange={(e) => setPetalsK(parseInt(e.target.value))}
                  className="w-full accent-[#7655E8]"
                />
              </div>
            )}

            {artType === 'lissajous' && (
              <>
                <div>
                  <div className="flex justify-between text-[11px] text-[#747989] mb-1">
                    <span>Frequency Ratio A</span>
                    <span className="font-mono-math">{lissajousA}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    step="1"
                    value={lissajousA}
                    onChange={(e) => setLissajousA(parseInt(e.target.value))}
                    className="w-full accent-[#7655E8]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#747989] mb-1">
                    <span>Frequency Ratio B</span>
                    <span className="font-mono-math">{lissajousB}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    step="1"
                    value={lissajousB}
                    onChange={(e) => setLissajousB(parseInt(e.target.value))}
                    className="w-full accent-[#7655E8]"
                  />
                </div>
              </>
            )}

            {/* Line Width */}
            <div>
              <div className="flex justify-between text-[11px] text-[#747989] mb-1">
                <span>Stroke Weight</span>
                <span className="font-mono-math">{lineWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                className="w-full accent-[#7655E8]"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A] space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-[#7655E8] hover:bg-[#6846D8] text-white text-xs font-semibold shadow-xs"
            >
              {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAnimating ? 'Pause' : 'Animate'}</span>
            </button>
            <button
              onClick={handleExportPNG}
              className="p-2 rounded-xl bg-[#F1F2F6] dark:bg-[#20202F] text-[#747989] hover:text-[#171923] dark:hover:text-white"
              title="Export High-Res PNG"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Art Canvas */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-xl max-w-full max-h-full block"
        />
      </div>
    </div>
  );
};
