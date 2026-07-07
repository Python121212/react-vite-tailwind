/**
 * AI自動モデル選択システム
 * タスクに応じて最適なモデルを自動選択
 */

export interface TaskAnalysis {
  type: "simple" | "coding" | "reasoning" | "creative" | "translation";
  complexity: "low" | "medium" | "high";
  recommendedModel: string;
  reason: string;
}

export class ModelSelectorAI {
  private customRules: Map<string, string> = new Map();

  /**
   * タスク分析
   */
  analyzeTask(input: string): TaskAnalysis {
    const inputLower = input.toLowerCase();
    
    // 簡単な挨拶や要約
    if (this.isSimpleTask(inputLower)) {
      return {
        type: "simple",
        complexity: "low",
        recommendedModel: "SmolLM2-360M-Instruct-q4f16_1-MLC",
        reason: "簡単なタスクには超軽量モデルで十分です（爆速）",
      };
    }

    // プログラミング
    if (this.isCodingTask(inputLower)) {
      const complexity = this.estimateCodeComplexity(inputLower);
      
      if (complexity === "high") {
        return {
          type: "coding",
          complexity: "high",
          recommendedModel: "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
          reason: "高度なコーディングタスクには専門モデルが最適",
        };
      } else {
        return {
          type: "coding",
          complexity: "medium",
          recommendedModel: "deepseek-coder-6.7b-instruct-q4f16_1-MLC",
          reason: "コーディングタスクに特化したモデル",
        };
      }
    }

    // 論理的思考・推論
    if (this.isReasoningTask(inputLower)) {
      return {
        type: "reasoning",
        complexity: "high",
        recommendedModel: "Llama-3.1-8B-Instruct-q4f16_1-MLC",
        reason: "論理的思考には高性能な推論モデルが必要",
      };
    }

    // 翻訳
    if (this.isTranslationTask(inputLower)) {
      return {
        type: "translation",
        complexity: "medium",
        recommendedModel: "Qwen2.5-7B-Instruct-q4f16_1-MLC",
        reason: "多言語対応に優れたモデル",
      };
    }

    // クリエイティブ
    if (this.isCreativeTask(inputLower)) {
      return {
        type: "creative",
        complexity: "medium",
        recommendedModel: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
        reason: "創造的なタスクにバランスの良いモデル",
      };
    }

    // デフォルト（汎用）
    return {
      type: "simple",
      complexity: "medium",
      recommendedModel: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
      reason: "汎用的なタスクに最適なバランス型",
    };
  }

  /**
   * 簡単なタスクか判定
   */
  private isSimpleTask(input: string): boolean {
    const simplePatterns = [
      /^(こんにちは|hello|hi|hey)/,
      /^(ありがとう|thank)/,
      /^(はい|yes|no|いいえ)/,
      /要約して/,
      /^.{1,30}$/,  // 短い入力
    ];

    return simplePatterns.some(pattern => pattern.test(input));
  }

  /**
   * コーディングタスクか判定
   */
  private isCodingTask(input: string): boolean {
    const codingKeywords = [
      "コード", "code", "プログラム", "program", "関数", "function",
      "クラス", "class", "バグ", "bug", "デバッグ", "debug",
      "リファクタリング", "refactor", "実装", "implement",
      "アルゴリズム", "algorithm", "api", "ライブラリ", "library",
      "フレームワーク", "framework", "javascript", "python", "java",
      "typescript", "react", "vue", "angular", "node",
    ];

    return codingKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * コードの複雑度推定
   */
  private estimateCodeComplexity(input: string): "low" | "medium" | "high" {
    const highComplexityKeywords = [
      "アーキテクチャ", "architecture", "設計", "design pattern",
      "最適化", "optimization", "パフォーマンス", "performance",
      "スケーラビリティ", "scalability", "セキュリティ", "security",
      "マイクロサービス", "microservices", "分散", "distributed",
    ];

    if (highComplexityKeywords.some(keyword => input.includes(keyword))) {
      return "high";
    }

    if (input.length > 200) {
      return "high";
    }

    if (input.length > 100) {
      return "medium";
    }

    return "low";
  }

  /**
   * 推論タスクか判定
   */
  private isReasoningTask(input: string): boolean {
    const reasoningKeywords = [
      "なぜ", "why", "理由", "reason", "説明", "explain",
      "分析", "analyze", "考察", "考えて", "think",
      "論理", "logic", "証明", "proof", "推論", "reasoning",
      "比較", "compare", "評価", "evaluate", "判断", "judge",
    ];

    return reasoningKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * 翻訳タスクか判定
   */
  private isTranslationTask(input: string): boolean {
    const translationKeywords = [
      "翻訳", "translate", "英語", "english", "中国語", "chinese",
      "日本語", "japanese", "言語", "language",
    ];

    return translationKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * クリエイティブタスクか判定
   */
  private isCreativeTask(input: string): boolean {
    const creativeKeywords = [
      "物語", "story", "小説", "novel", "詩", "poem",
      "アイデア", "idea", "創造", "creative", "ブレスト", "brainstorm",
      "企画", "plan", "提案", "proposal",
    ];

    return creativeKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * カスタムルール追加
   */
  addCustomRule(pattern: string, modelId: string): void {
    this.customRules.set(pattern, modelId);
  }

  /**
   * カスタムルール削除
   */
  removeCustomRule(pattern: string): void {
    this.customRules.delete(pattern);
  }

  /**
   * カスタムルール取得
   */
  getCustomRules(): Map<string, string> {
    return new Map(this.customRules);
  }

  /**
   * カスタムルールでモデル選択
   */
  selectByCustomRules(input: string): string | null {
    for (const [pattern, modelId] of this.customRules.entries()) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(input)) {
        return modelId;
      }
    }
    return null;
  }

  /**
   * 最適モデル選択（カスタムルール優先）
   */
  selectOptimalModel(input: string): { model: string; reason: string } {
    // カスタムルールチェック
    const customModel = this.selectByCustomRules(input);
    if (customModel) {
      return {
        model: customModel,
        reason: "カスタムルールに基づいて選択",
      };
    }

    // 自動分析
    const analysis = this.analyzeTask(input);
    return {
      model: analysis.recommendedModel,
      reason: analysis.reason,
    };
  }
}

export const modelSelectorAI = new ModelSelectorAI();
