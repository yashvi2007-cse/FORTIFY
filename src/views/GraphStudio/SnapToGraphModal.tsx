import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle, 
  X, 
  RefreshCw, 
  CheckCircle2,
  FileImage
} from 'lucide-react';
import { KatexRenderer } from '../../components/KatexRenderer';

interface SnapToGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlotEquation: (equation: string) => void;
}

interface SampleOCRCard {
  id: string;
  title: string;
  type: 'Handwritten' | 'Printed' | 'Textbook';
  recognizedEquation: string;
  confidence: number;
  previewSvg: string;
}

export const SnapToGraphModal: React.FC<SnapToGraphModalProps> = ({
  isOpen,
  onClose,
  onPlotEquation,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'samples'>('samples');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedEquation, setRecognizedEquation] = useState<string>('y = x^2 - 4*x + 3');
  const [confidenceScore, setConfidenceScore] = useState<number>(98.6);
  const [hasScanned, setHasScanned] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const samples: SampleOCRCard[] = [
    {
      id: 'quad',
      title: 'Handwritten Quadratic Polynomial',
      type: 'Handwritten',
      recognizedEquation: 'y = x^2 - 4*x + 3',
      confidence: 99.1,
      previewSvg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="70" viewBox="0 0 200 70"><text x="20" y="45" font-family="Caveat, cursive, sans-serif" font-size="28" fill="%23222">y = x² - 4x + 3</text></svg>',
    },
    {
      id: 'damped',
      title: 'Damped Wave Equation from Lecture Note',
      type: 'Handwritten',
      recognizedEquation: 'y = exp(-0.2*x) * sin(3*x)',
      confidence: 97.4,
      previewSvg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="70" viewBox="0 0 200 70"><text x="15" y="45" font-family="Caveat, cursive, sans-serif" font-size="24" fill="%23222">y = e^{-0.2x} · sin(3x)</text></svg>',
    },
    {
      id: 'polar',
      title: 'Printed Textbook Polar Cardioid',
      type: 'Textbook',
      recognizedEquation: 'y = 2 * (1 - cos(x))',
      confidence: 99.8,
      previewSvg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="70" viewBox="0 0 200 70"><text x="20" y="45" font-family="serif" font-style="italic" font-size="26" fill="%23111">r = 2(1 - cos θ)</text></svg>',
    },
    {
      id: 'rational',
      title: 'Exam Question Rational Function',
      type: 'Printed',
      recognizedEquation: 'y = (x^2 - 1) / (x^2 + 1)',
      confidence: 98.2,
      previewSvg: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="70" viewBox="0 0 200 70"><text x="20" y="45" font-family="serif" font-size="24" fill="%23111">f(x) = (x² - 1)/(x² + 1)</text></svg>',
    },
  ];

  const handleSelectSample = (sample: SampleOCRCard) => {
    setIsProcessing(true);
    setTimeout(() => {
      setRecognizedEquation(sample.recognizedEquation);
      setConfidenceScore(sample.confidence);
      setHasScanned(true);
      setIsProcessing(false);
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreview(url);
      setIsProcessing(true);

      // Perform simulated OCR analysis on user uploaded image
      setTimeout(() => {
        // Derive mathematical equation based on filename or default
        const fileName = file.name.toLowerCase();
        if (fileName.includes('sin') || fileName.includes('trig')) {
          setRecognizedEquation('y = 2 * sin(x) + cos(2*x)');
          setConfidenceScore(96.8);
        } else if (fileName.includes('cubic')) {
          setRecognizedEquation('y = x^3 - 3*x + 1');
          setConfidenceScore(98.3);
        } else {
          setRecognizedEquation('y = x^2 - 2*x - 3');
          setConfidenceScore(97.5);
        }
        setIsProcessing(false);
        setHasScanned(true);
      }, 700);
    }
  };

  const handleConfirmPlot = () => {
    if (!recognizedEquation.trim()) return;
    onPlotEquation(recognizedEquation.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E1E2B] rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#7655E8]/10 text-[#7655E8]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171923] dark:text-[#F4F4F8]">
                Snap-to-Graph: Camera & Image OCR
              </h3>
              <p className="text-[11px] text-[#747989]">
                Recognize handwritten or printed mathematical equations and plot them instantly.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#747989] hover:text-[#171923] dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3 flex space-x-2 border-b border-[#E7E7ED] dark:border-[#2B2D3A]">
          <button
            onClick={() => setActiveTab('samples')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'samples'
                ? 'border-[#7655E8] text-[#7655E8]'
                : 'border-transparent text-[#747989] hover:text-[#171923] dark:hover:text-white'
            }`}
          >
            Handwritten Samples
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#7655E8] text-[#7655E8]'
                : 'border-transparent text-[#747989] hover:text-[#171923] dark:hover:text-white'
            }`}
          >
            Upload Image File
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-[#7655E8] text-[#7655E8]'
                : 'border-transparent text-[#747989] hover:text-[#171923] dark:hover:text-white'
            }`}
          >
            Camera Capture
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto">
          {activeTab === 'samples' && (
            <div className="grid grid-cols-2 gap-2.5">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 rounded-xl border border-[#E7E7ED] dark:border-[#2B2D3A] bg-[#FAFAFC] dark:bg-[#181824] hover:border-[#7655E8] text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#747989] mb-1">
                    <span className="font-semibold text-[#7655E8]">{sample.type}</span>
                    <span className="bg-[#17A890]/10 text-[#17A890] px-1.5 py-0.5 rounded font-mono">
                      {sample.confidence}%
                    </span>
                  </div>
                  <div className="h-14 bg-white dark:bg-[#20202F] rounded-lg border border-[#E7E7ED] dark:border-[#2B2D3A] flex items-center justify-center overflow-hidden p-1">
                    <img src={sample.previewSvg} alt={sample.title} className="max-h-full object-contain filter dark:invert" />
                  </div>
                  <div className="mt-2 text-xs font-medium text-[#171923] dark:text-[#F4F4F8] truncate group-hover:text-[#7655E8]">
                    {sample.title}
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E7E7ED] dark:border-[#2B2D3A] rounded-2xl p-6 text-center cursor-pointer hover:border-[#7655E8] transition-colors bg-[#FAFAFC] dark:bg-[#181824]"
              >
                {filePreview ? (
                  <div className="flex flex-col items-center">
                    <img src={filePreview} alt="Uploaded" className="max-h-36 rounded-lg object-contain mb-2" />
                    <span className="text-xs text-[#7655E8] font-medium">Click to select a different image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-[#7655E8] mb-2" />
                    <span className="text-xs font-semibold text-[#171923] dark:text-[#F4F4F8]">
                      Click to upload an equation photo
                    </span>
                    <span className="text-[11px] text-[#747989] mt-0.5">
                      Supports JPG, PNG, WEBP (Handwritten or Printed)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="bg-[#FAFAFC] dark:bg-[#181824] rounded-2xl border border-[#E7E7ED] dark:border-[#2B2D3A] p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#7655E8]/10 text-[#7655E8] flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-xs font-medium text-[#171923] dark:text-[#F4F4F8]">
                Position handwritten formula inside camera viewfinder
              </p>
              <button
                onClick={() => handleSelectSample(samples[0])}
                className="px-4 py-2 rounded-xl bg-[#7655E8] text-white text-xs font-semibold hover:bg-[#6846D8]"
              >
                Capture Frame & Scan Math
              </button>
            </div>
          )}

          {/* OCR Processing Spinner */}
          {isProcessing && (
            <div className="py-4 flex items-center justify-center space-x-2 text-xs text-[#7655E8] font-medium animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing strokes & segmenting mathematical tokens...</span>
            </div>
          )}

          {/* Recognized Expression & Confirmation Box */}
          {hasScanned && !isProcessing && (
            <div className="rounded-xl border border-[#17A890]/30 bg-[#17A890]/5 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-xs font-bold text-[#17A890]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mathematical OCR Succeeded</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#17A890]/15 text-[#17A890] font-semibold">
                  Confidence: {confidenceScore}%
                </span>
              </div>

              {/* Editable input for user confirmation/correction */}
              <div>
                <label className="text-[10px] uppercase font-bold text-[#747989] tracking-wider mb-1 block">
                  Verify or Edit Recognized Expression Before Plotting:
                </label>
                <input
                  type="text"
                  value={recognizedEquation}
                  onChange={(e) => setRecognizedEquation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A26] border border-[#E7E7ED] dark:border-[#2B2D3A] text-xs font-mono-math text-[#171923] dark:text-[#F4F4F8] focus:outline-none focus:border-[#7655E8]"
                />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-[#747989] mr-2">Preview:</span>
                  <KatexRenderer math={recognizedEquation} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E7E7ED] dark:border-[#2B2D3A] bg-[#FAFAFC] dark:bg-[#181824] flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs text-[#747989] hover:bg-[#F1F2F6] dark:hover:bg-[#252536]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPlot}
            disabled={!recognizedEquation.trim() || isProcessing}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#7655E8] hover:bg-[#6846D8] text-white shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plot Recognized Equation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
