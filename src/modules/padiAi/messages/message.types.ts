export interface StartConversation {
    title: string,
    conversationId?: string
}

export interface GeminiUsage {
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

export interface GeminiContent {
  type: "text";
  text: string;
}

export interface GeminiStep {
  type: "thought" | "model_output";
  signature?: string;
  content?: GeminiContent[];
}

export interface GeminiResponse {
  id: string;
  status: "completed" | "failed" | "in_progress";
  usage: GeminiUsage;
  created: string;
  steps: GeminiStep[];
  object: "interaction";
  model: string;
}