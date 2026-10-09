export type SourceStatus = 
  | 'source-identified'       // Trích xuất trực tiếp từ mã nguồn notebook
  | 'concept-explanation'     // Giải thích khái niệm dựa trên mã
  | 'ui-simulation'          // Chức năng mô phỏng an toàn trong UI
  | 'needs-verification';    // Cần kiểm chứng trên phần cứng / runtime thực tế

export type TaskCategory = 
  | 'teleoperation'
  | 'road-following'
  | 'collision-avoidance'
  | 'tensorrt-optimization';

export interface CodeBlock {
  language: string;
  code: string;
  cellIndex?: number;
  cellType?: 'code' | 'markdown';
  captionVi?: string;
  annotations?: {
    line: number;
    explanation: string;
    impactOnRobot: string;
  }[];
}

export interface ModuleMeta {
  id: string;
  number: number;
  nameVi: string;
  notebookName: string;
  category: TaskCategory;
  categoryNameVi: string;
  taskTypeVi: 'Điều khiển thủ công' | 'Hồi quy tọa độ (Regression)' | 'Phân loại ảnh (Classification)' | 'Biên dịch tối ưu (Engine Build)' | 'Suy luận tối ưu (Inference)';
  targetGoalVi: string;
  descriptionVi: string;
  dataFlow: {
    input: string;
    process: string;
    output: string;
  };
  keyFunctions: string[];
  codeSnippets: CodeBlock[];
  hardwareRequirements: string[];
  caveatsAndErrors: string[];
  simulationFeature: string;
}

export interface FunctionEntry {
  id: string;
  name: string;
  kind: 'function' | 'class' | 'variable' | 'property' | 'library' | 'shell-command' | 'concept';
  group: 'camera' | 'motor' | 'gamepad' | 'vision' | 'dataset' | 'training' | 'inference' | 'tensorrt' | 'system';
  groupNameVi: string;
  moduleIds: string[];
  sourceNotebooks: string[];
  summaryVi: string;
  explanationVi: string;
  syntax?: string;
  inputs?: string[];
  outputs?: string[];
  codeExample?: string;
  sourceStatus: SourceStatus;
  cautions?: string[];
  level: 'basic' | 'intermediate' | 'advanced';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedModuleId: string;
  topic: string;
}

export interface GlossaryTerm {
  term: string;
  vietnamese: string;
  category: string;
  definition: string;
  realWorldContext: string;
  notebookLink?: string;
}

export type ViewTab = 
  | 'home'
  | 'robot-sim'
  | 'modules'
  | 'functions'
  | 'pipeline'
  | 'training-charts'
  | 'what-if'
  | 'quiz'
  | 'glossary'
  | 'sources';
