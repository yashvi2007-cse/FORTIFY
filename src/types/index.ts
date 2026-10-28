export type NavigationTab = 
  | 'home' 
  // Core Desmos Math Tools Suite
  | 'graph-studio' 
  | 'scientific-calc' 
  | 'four-function-calc' 
  | 'notebook' 
  | 'matrix-calc' 
  | 'geometry-studio' 
  | '3d-universe' 
  // Additional Intelligent Labs
  | 'ai-tutor' 
  | 'live-graph' 
  | 'graph-iq' 
  | 'math-art' 
  | 'knowledge-map' 
  | 'workspace';

export interface ExpressionItem {
  id: string;
  latex: string;
  raw: string; // e.g., "y = x^2 - 4" or "f(x) = sin(x)" or "a = 2"
  color: string;
  visible: boolean;
  type: 'function' | 'slider' | 'implicit' | 'parametric' | 'point';
  // If slider:
  sliderParam?: string;
  sliderVal?: number;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  isAnimating?: boolean;
  // Visual options
  showDerivative?: boolean;
  showIntegral?: boolean;
  integralRange?: [number, number];
  lineWidth?: number;
}

export interface GraphViewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface GraphSnapshot {
  id: string;
  timestamp: number;
  title: string;
  expressions: ExpressionItem[];
  viewport: GraphViewport;
  description?: string;
  changedParam?: string;
}

export interface HealthIssue {
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  expressionId: string;
  suggestion?: string;
  fixedExpression?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestedAction?: {
    label: string;
    actionType: 'add-expression' | 'set-slider' | 'set-viewport';
    payload: any;
  };
  stepByStep?: string[];
  visualFormula?: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  difficulty: 'Novice' | 'Explorer' | 'Advanced' | 'Master';
  prompt: string;
  equation: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  graphPreset: {
    expressions: ExpressionItem[];
    viewport: GraphViewport;
  };
  userInteractiveType: 'multiple-choice' | 'drag-slider' | 'enter-expression';
  sliderTarget?: {
    param: string;
    correctVal: number;
    tolerance: number;
  };
}

export interface ConceptNode {
  id: string;
  label: string;
  category: string;
  status: 'mastered' | 'in-progress' | 'recommended' | 'locked';
  prerequisites: string[];
  description: string;
  equationExample: string;
  relatedTab: NavigationTab;
  tabPayload?: any;
}

export interface SavedGraphProject {
  id: string;
  title: string;
  folder: string;
  updatedAt: string;
  expressions: ExpressionItem[];
  tags: string[];
  favorite?: boolean;
}
