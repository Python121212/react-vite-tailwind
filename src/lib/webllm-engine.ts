import * as webllm from "@mlc-ai/web-llm";

export interface EngineConfig {
  model: string;
  temperature?: number;
  top_p?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class WebLLMEngine {
  private engine: webllm.MLCEngine | null = null;
  private currentModel: string | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  async initialize(
    modelId: string,
    onProgress?: (report: webllm.InitProgressReport) => void
  ): Promise<void> {
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    if (this.engine && this.currentModel === modelId) {
      return;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        if (this.engine) {
          await this.engine.unload();
        }

        this.engine = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: onProgress,
        });

        this.currentModel = modelId;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  async chat(
    messages: ChatMessage[],
    onUpdate?: (message: string) => void
  ): Promise<string> {
    if (!this.engine) {
      throw new Error("Engine not initialized");
    }

    const chunks: string[] = [];
    const completion = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    });

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        chunks.push(delta);
        if (onUpdate) {
          onUpdate(chunks.join(""));
        }
      }
    }

    return chunks.join("");
  }

  async getGPUInfo(): Promise<string> {
    if (!this.engine) {
      return "エンジン未初期化";
    }
    return this.engine.runtimeStatsText();
  }

  isReady(): boolean {
    return this.engine !== null && !this.isInitializing;
  }

  getCurrentModel(): string | null {
    return this.currentModel;
  }

  async unload(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.currentModel = null;
    }
  }
}

export const availableModels = [
  // Llama 3.2 シリーズ
  "Llama-3.2-3B-Instruct-q4f32_1-MLC",
  "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  "Llama-3.2-1B-Instruct-q4f32_1-MLC",
  "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  
  // Llama 3.1 シリーズ
  "Llama-3.1-8B-Instruct-q4f32_1-MLC",
  "Llama-3.1-8B-Instruct-q4f16_1-MLC",
  
  // Qwen 2.5 シリーズ
  "Qwen2.5-7B-Instruct-q4f32_1-MLC",
  "Qwen2.5-7B-Instruct-q4f16_1-MLC",
  "Qwen2.5-3B-Instruct-q4f32_1-MLC",
  "Qwen2.5-3B-Instruct-q4f16_1-MLC",
  "Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  "Qwen2.5-0.5B-Instruct-q4f32_1-MLC",
  "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
  "Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC",
  "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
  "Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC",
  "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
  "Qwen2.5-Math-7B-Instruct-q4f32_1-MLC",
  "Qwen2.5-Math-7B-Instruct-q4f16_1-MLC",
  "Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC",
  "Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC",
  
  // Qwen 2 シリーズ
  "Qwen2-7B-Instruct-q4f32_1-MLC",
  "Qwen2-7B-Instruct-q4f16_1-MLC",
  "Qwen2-1.5B-Instruct-q4f32_1-MLC",
  "Qwen2-1.5B-Instruct-q4f16_1-MLC",
  "Qwen2-0.5B-Instruct-q4f32_1-MLC",
  "Qwen2-0.5B-Instruct-q4f16_1-MLC",
  
  // Phi-3 シリーズ
  "Phi-3.5-mini-instruct-q4f32_1-MLC",
  "Phi-3.5-mini-instruct-q4f16_1-MLC",
  "Phi-3-mini-4k-instruct-q4f32_1-MLC",
  "Phi-3-mini-4k-instruct-q4f16_1-MLC",
  "Phi-3-mini-128k-instruct-q4f32_1-MLC",
  "Phi-3-mini-128k-instruct-q4f16_1-MLC",
  "Phi-3-medium-128k-instruct-q4f16_1-MLC",
  
  // Phi-2
  "Phi-2-q4f32_1-MLC",
  "Phi-2-q4f16_1-MLC",
  
  // Gemma 2 シリーズ
  "gemma-2-9b-it-q4f32_1-MLC",
  "gemma-2-9b-it-q4f16_1-MLC",
  "gemma-2-2b-it-q4f32_1-MLC",
  "gemma-2-2b-it-q4f16_1-MLC",
  
  // Gemma 1 シリーズ
  "gemma-7b-it-q4f32_1-MLC",
  "gemma-7b-it-q4f16_1-MLC",
  "gemma-2b-it-q4f32_1-MLC",
  "gemma-2b-it-q4f16_1-MLC",
  
  // SmolLM2 シリーズ
  "SmolLM2-1.7B-Instruct-q4f32_1-MLC",
  "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
  "SmolLM2-360M-Instruct-q4f32_1-MLC",
  "SmolLM2-360M-Instruct-q4f16_1-MLC",
  "SmolLM2-135M-Instruct-q4f32_1-MLC",
  "SmolLM2-135M-Instruct-q4f16_1-MLC",
  
  // Mistral シリーズ
  "Mistral-7B-Instruct-v0.3-q4f32_1-MLC",
  "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
  "Mistral-7B-Instruct-v0.2-q4f32_1-MLC",
  "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
  
  // Hermes シリーズ
  "Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",
  "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
  "Hermes-2-Pro-Mistral-7B-q4f32_1-MLC",
  "Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
  
  // OpenHermes
  "OpenHermes-2.5-Mistral-7B-q4f32_1-MLC",
  "OpenHermes-2.5-Mistral-7B-q4f16_1-MLC",
  
  // WizardLM シリーズ
  "WizardLM-2-7B-q4f16_1-MLC",
  "WizardMath-7B-V1.1-q4f16_1-MLC",
  
  // TinyLlama
  "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
  "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
  
  // RedPajama
  "RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
  "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
  
  // StableLM シリーズ
  "stablelm-2-zephyr-1_6b-q4f32_1-MLC",
  "stablelm-2-zephyr-1_6b-q4f16_1-MLC",
  
  // Codestral
  "Codestral-22B-v0.1-q3f16_1-MLC",
  
  // DeepSeek Coder シリーズ
  "deepseek-coder-6.7b-instruct-q4f32_1-MLC",
  "deepseek-coder-6.7b-instruct-q4f16_1-MLC",
  "deepseek-coder-1.3b-instruct-q4f32_1-MLC",
  "deepseek-coder-1.3b-instruct-q4f16_1-MLC",
  
  // CodeLlama シリーズ
  "CodeLlama-7b-Instruct-hf-q4f32_1-MLC",
  "CodeLlama-7b-Instruct-hf-q4f16_1-MLC",
  
  // Vicuna シリーズ
  "vicuna-v1-7b-q4f32_1-MLC",
  "vicuna-v1-7b-q4f16_1-MLC",
  
  // Solar シリーズ
  "SOLAR-10.7B-Instruct-v1.0-q4f16_1-MLC",
  
  // Sheared LLaMA
  "sheared-llama-2.7b-q4f16_1-MLC",
  "sheared-llama-1.3b-q4f16_1-MLC",
  
  // Yi シリーズ
  "Yi-1.5-9B-Chat-q4f16_1-MLC",
  "Yi-1.5-6B-Chat-q4f16_1-MLC",
  
  // InternLM シリーズ
  "internlm2_5-7b-chat-q4f16_1-MLC",
  "internlm2-chat-7b-q4f16_1-MLC",
  "internlm2-chat-1_8b-q4f16_1-MLC",
  
  // MiniCPM シリーズ
  "MiniCPM-2B-dpo-q4f32_1-MLC",
  "MiniCPM-2B-dpo-q4f16_1-MLC",
  
  // Nous Hermes
  "Nous-Hermes-2-Mistral-7B-DPO-q4f16_1-MLC",
  
  // Zephyr シリーズ
  "zephyr-7b-beta-q4f16_1-MLC",
  
  // OpenChat シリーズ
  "openchat-3.5-1210-q4f16_1-MLC",
  
  // StarCoder シリーズ
  "starcoderplus-q4f16_1-MLC",
  
  // Orca シリーズ
  "orca-2-7b-q4f16_1-MLC",
  
  // Neural Chat
  "neural-chat-7b-v3-1-q4f16_1-MLC",
  
  // Dolphin シリーズ
  "dolphin-2.6-mistral-7b-q4f16_1-MLC",
];
