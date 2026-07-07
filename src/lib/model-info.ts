export interface ModelInfo {
  id: string;
  name: string;
  size: string;
  description: string;
  recommended: boolean;
  category?: string;
}

const generateModelInfo = (
  id: string,
  name: string,
  size: string,
  description: string,
  recommended: boolean = false,
  category?: string
): ModelInfo => ({
  id,
  name,
  size,
  description,
  recommended,
  category,
});

export const modelInfoMap: Record<string, ModelInfo> = {
  // Llama 3.2 シリーズ
  "Llama-3.2-3B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Llama-3.2-3B-Instruct-q4f32_1-MLC",
    "Llama 3.2 3B (q4f32)",
    "約2.2GB",
    "Meta最新モデル。汎用性が高く日本語対応",
    true,
    "汎用"
  ),
  "Llama-3.2-3B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    "Llama 3.2 3B (q4f16)",
    "約1.9GB",
    "Meta最新モデル。高速版",
    true,
    "汎用"
  ),
  "Llama-3.2-1B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    "Llama 3.2 1B (q4f32)",
    "約0.8GB",
    "超軽量版。低スペック環境に最適",
    false,
    "軽量"
  ),
  "Llama-3.2-1B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    "Llama 3.2 1B (q4f16)",
    "約0.6GB",
    "最軽量版。モバイル環境向け",
    false,
    "軽量"
  ),
  
  // Llama 3.1 シリーズ
  "Llama-3.1-8B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Llama-3.1-8B-Instruct-q4f32_1-MLC",
    "Llama 3.1 8B (q4f32)",
    "約5.5GB",
    "高性能版。複雑なタスクに対応",
    true,
    "汎用"
  ),
  "Llama-3.1-8B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Llama-3.1-8B-Instruct-q4f16_1-MLC",
    "Llama 3.1 8B (q4f16)",
    "約4.8GB",
    "高性能版。高速推論",
    true,
    "汎用"
  ),
  
  // Qwen 2.5 シリーズ
  "Qwen2.5-7B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Qwen2.5-7B-Instruct-q4f32_1-MLC",
    "Qwen 2.5 7B (q4f32)",
    "約4.8GB",
    "多言語対応。中国語・日本語に強い",
    true,
    "汎用"
  ),
  "Qwen2.5-7B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Qwen2.5-7B-Instruct-q4f16_1-MLC",
    "Qwen 2.5 7B (q4f16)",
    "約4.2GB",
    "多言語対応の高速版",
    true,
    "汎用"
  ),
  "Qwen2.5-3B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Qwen2.5-3B-Instruct-q4f32_1-MLC",
    "Qwen 2.5 3B (q4f32)",
    "約2.0GB",
    "バランス型。日常使いに最適",
    true,
    "汎用"
  ),
  "Qwen2.5-3B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    "Qwen 2.5 3B (q4f16)",
    "約1.7GB",
    "バランス型の高速版",
    true,
    "汎用"
  ),
  "Qwen2.5-1.5B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
    "Qwen 2.5 1.5B (q4f32)",
    "約1.0GB",
    "軽量・高速・多言語",
    false,
    "軽量"
  ),
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    "Qwen 2.5 1.5B (q4f16)",
    "約0.9GB",
    "超軽量・超高速",
    false,
    "軽量"
  ),
  "Qwen2.5-0.5B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Qwen2.5-0.5B-Instruct-q4f32_1-MLC",
    "Qwen 2.5 0.5B (q4f32)",
    "約0.4GB",
    "最小サイズ。テスト用",
    false,
    "軽量"
  ),
  "Qwen2.5-0.5B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    "Qwen 2.5 0.5B (q4f16)",
    "約0.3GB",
    "最小サイズの高速版",
    false,
    "軽量"
  ),
  
  // Qwen 2.5 Coder (プログラミング特化)
  "Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC",
    "Qwen 2.5 Coder 7B",
    "約4.8GB",
    "コーディング特化。高精度なコード生成",
    true,
    "コーディング"
  ),
  "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
    "Qwen 2.5 Coder 7B (f16)",
    "約4.2GB",
    "コーディング特化の高速版",
    true,
    "コーディング"
  ),
  "Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC",
    "Qwen 2.5 Coder 1.5B",
    "約1.0GB",
    "軽量コーディングモデル",
    false,
    "コーディング"
  ),
  "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
    "Qwen 2.5 Coder 1.5B (f16)",
    "約0.9GB",
    "軽量コーディングモデル高速版",
    false,
    "コーディング"
  ),
  
  // Qwen 2.5 Math (数学特化)
  "Qwen2.5-Math-7B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Qwen2.5-Math-7B-Instruct-q4f32_1-MLC",
    "Qwen 2.5 Math 7B",
    "約4.8GB",
    "数学・科学計算特化モデル",
    false,
    "数学"
  ),
  "Qwen2.5-Math-7B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Qwen2.5-Math-7B-Instruct-q4f16_1-MLC",
    "Qwen 2.5 Math 7B (f16)",
    "約4.2GB",
    "数学特化の高速版",
    false,
    "数学"
  ),
  "Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC": generateModelInfo(
    "Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC",
    "Qwen 2.5 Math 1.5B",
    "約1.0GB",
    "軽量数学モデル",
    false,
    "数学"
  ),
  "Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC": generateModelInfo(
    "Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC",
    "Qwen 2.5 Math 1.5B (f16)",
    "約0.9GB",
    "軽量数学モデル高速版",
    false,
    "数学"
  ),
  
  // Phi-3 シリーズ (Microsoft)
  "Phi-3.5-mini-instruct-q4f32_1-MLC": generateModelInfo(
    "Phi-3.5-mini-instruct-q4f32_1-MLC",
    "Phi 3.5 Mini (q4f32)",
    "約2.5GB",
    "Microsoft製。高品質な小型モデル",
    true,
    "汎用"
  ),
  "Phi-3.5-mini-instruct-q4f16_1-MLC": generateModelInfo(
    "Phi-3.5-mini-instruct-q4f16_1-MLC",
    "Phi 3.5 Mini (q4f16)",
    "約2.2GB",
    "Microsoft製の高速版",
    true,
    "汎用"
  ),
  "Phi-3-mini-4k-instruct-q4f32_1-MLC": generateModelInfo(
    "Phi-3-mini-4k-instruct-q4f32_1-MLC",
    "Phi 3 Mini 4K",
    "約2.3GB",
    "4Kコンテキスト対応",
    false,
    "汎用"
  ),
  "Phi-3-mini-128k-instruct-q4f32_1-MLC": generateModelInfo(
    "Phi-3-mini-128k-instruct-q4f32_1-MLC",
    "Phi 3 Mini 128K",
    "約2.5GB",
    "超長文対応(128Kトークン)",
    false,
    "汎用"
  ),
  
  // Gemma 2 シリーズ (Google)
  "gemma-2-9b-it-q4f32_1-MLC": generateModelInfo(
    "gemma-2-9b-it-q4f32_1-MLC",
    "Gemma 2 9B (q4f32)",
    "約5.8GB",
    "Google製の高性能モデル",
    true,
    "汎用"
  ),
  "gemma-2-9b-it-q4f16_1-MLC": generateModelInfo(
    "gemma-2-9b-it-q4f16_1-MLC",
    "Gemma 2 9B (q4f16)",
    "約5.2GB",
    "Google製の高速版",
    true,
    "汎用"
  ),
  "gemma-2-2b-it-q4f32_1-MLC": generateModelInfo(
    "gemma-2-2b-it-q4f32_1-MLC",
    "Gemma 2 2B (q4f32)",
    "約1.5GB",
    "Google製軽量モデル",
    false,
    "軽量"
  ),
  "gemma-2-2b-it-q4f16_1-MLC": generateModelInfo(
    "gemma-2-2b-it-q4f16_1-MLC",
    "Gemma 2 2B (q4f16)",
    "約1.3GB",
    "Google製軽量高速版",
    false,
    "軽量"
  ),
  
  // SmolLM2 (超軽量)
  "SmolLM2-1.7B-Instruct-q4f32_1-MLC": generateModelInfo(
    "SmolLM2-1.7B-Instruct-q4f32_1-MLC",
    "SmolLM2 1.7B",
    "約1.1GB",
    "超軽量・高効率モデル",
    false,
    "軽量"
  ),
  "SmolLM2-1.7B-Instruct-q4f16_1-MLC": generateModelInfo(
    "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
    "SmolLM2 1.7B (f16)",
    "約0.9GB",
    "超軽量・超高速",
    false,
    "軽量"
  ),
  "SmolLM2-360M-Instruct-q4f32_1-MLC": generateModelInfo(
    "SmolLM2-360M-Instruct-q4f32_1-MLC",
    "SmolLM2 360M",
    "約0.3GB",
    "極小モデル。テスト用",
    false,
    "軽量"
  ),
  "SmolLM2-135M-Instruct-q4f32_1-MLC": generateModelInfo(
    "SmolLM2-135M-Instruct-q4f32_1-MLC",
    "SmolLM2 135M",
    "約0.1GB",
    "最小モデル。実験用",
    false,
    "軽量"
  ),
  
  // Mistral (フランス製高性能)
  "Mistral-7B-Instruct-v0.3-q4f32_1-MLC": generateModelInfo(
    "Mistral-7B-Instruct-v0.3-q4f32_1-MLC",
    "Mistral 7B v0.3",
    "約4.5GB",
    "フランス製高性能モデル",
    true,
    "汎用"
  ),
  "Mistral-7B-Instruct-v0.3-q4f16_1-MLC": generateModelInfo(
    "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
    "Mistral 7B v0.3 (f16)",
    "約4.0GB",
    "Mistral高速版",
    true,
    "汎用"
  ),
  
  // DeepSeek Coder (コーディング)
  "deepseek-coder-6.7b-instruct-q4f32_1-MLC": generateModelInfo(
    "deepseek-coder-6.7b-instruct-q4f32_1-MLC",
    "DeepSeek Coder 6.7B",
    "約4.2GB",
    "高精度コード生成に特化",
    true,
    "コーディング"
  ),
  "deepseek-coder-6.7b-instruct-q4f16_1-MLC": generateModelInfo(
    "deepseek-coder-6.7b-instruct-q4f16_1-MLC",
    "DeepSeek Coder 6.7B (f16)",
    "約3.8GB",
    "高精度コード生成高速版",
    true,
    "コーディング"
  ),
  "deepseek-coder-1.3b-instruct-q4f32_1-MLC": generateModelInfo(
    "deepseek-coder-1.3b-instruct-q4f32_1-MLC",
    "DeepSeek Coder 1.3B",
    "約0.9GB",
    "軽量コード生成モデル",
    false,
    "コーディング"
  ),
  
  // CodeLlama (Meta製コーディング)
  "CodeLlama-7b-Instruct-hf-q4f32_1-MLC": generateModelInfo(
    "CodeLlama-7b-Instruct-hf-q4f32_1-MLC",
    "CodeLlama 7B",
    "約4.5GB",
    "Meta製コーディング特化",
    false,
    "コーディング"
  ),
  
  // TinyLlama (超軽量)
  "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC": generateModelInfo(
    "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
    "TinyLlama 1.1B",
    "約0.7GB",
    "超軽量チャットモデル",
    false,
    "軽量"
  ),
  
  // 他のモデルのデフォルト情報
};

export const getModelInfo = (modelId: string): ModelInfo => {
  if (modelInfoMap[modelId]) {
    return modelInfoMap[modelId];
  }
  
  // デフォルト情報を生成
  const name = modelId.split("-").slice(0, 3).join(" ");
  let size = "不明";
  let category = "汎用";
  
  // サイズを推定
  if (modelId.includes("0.5B") || modelId.includes("135M") || modelId.includes("360M")) {
    size = "約0.3-0.5GB";
    category = "軽量";
  } else if (modelId.includes("1B") || modelId.includes("1.1B") || modelId.includes("1.3B") || modelId.includes("1.5B") || modelId.includes("1.7B")) {
    size = "約0.8-1.2GB";
    category = "軽量";
  } else if (modelId.includes("2B")) {
    size = "約1.5-2GB";
  } else if (modelId.includes("3B")) {
    size = "約2-2.5GB";
  } else if (modelId.includes("6B") || modelId.includes("7B")) {
    size = "約4-5GB";
  } else if (modelId.includes("8B") || modelId.includes("9B")) {
    size = "約5-6GB";
  } else if (modelId.includes("13B")) {
    size = "約8-10GB";
  }
  
  // カテゴリを判定
  if (modelId.toLowerCase().includes("coder") || modelId.toLowerCase().includes("code")) {
    category = "コーディング";
  } else if (modelId.toLowerCase().includes("math")) {
    category = "数学";
  }
  
  return {
    id: modelId,
    name,
    size,
    description: "高性能言語モデル",
    recommended: false,
    category,
  };
};
