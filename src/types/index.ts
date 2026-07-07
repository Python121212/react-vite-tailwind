export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  artifacts?: Artifact[];
  isStreaming?: boolean;
  thinkingSteps?: ThinkingStep[];
  parentId?: string | null;
  branchCount?: number;
}

export interface ThinkingStep {
  id: string;
  step: number;
  content: string;
  timestamp: number;
}

export interface Artifact {
  id: string;
  type: "code" | "text" | "data";
  language?: string;
  filename: string;
  content: string;
  timestamp: number;
}

export interface SystemStats {
  gpuLoad: string;
  generationSpeed: string;
  lastSync: string;
  modelLoaded: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}
