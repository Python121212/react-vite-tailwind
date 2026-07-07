/**
 * プロンプトテンプレート管理
 * 変数埋め込み機能付き
 */

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  description: string;
  variables: string[];
  category: string;
  favorite: boolean;
  usageCount: number;
  createdAt: number;
}

export class PromptTemplateManager {
  private templates: Map<string, PromptTemplate> = new Map();
  private dbName = "PromptTemplates_DB";

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    await this.loadFromIndexedDB();
    
    // デフォルトテンプレート追加
    if (this.templates.size === 0) {
      this.addDefaultTemplates();
    }
  }

  /**
   * デフォルトテンプレート追加
   */
  private addDefaultTemplates(): void {
    const defaults: Omit<PromptTemplate, "id" | "createdAt" | "usageCount">[] = [
      {
        name: "コードリファクタリング",
        template: "以下のコードをリファクタリングしてください：\n\n{{code}}\n\n改善点：\n- 可読性の向上\n- パフォーマンスの最適化\n- ベストプラクティスの適用",
        description: "コードの品質を向上させます",
        variables: ["code"],
        category: "コーディング",
        favorite: true,
      },
      {
        name: "バグ修正",
        template: "以下のコードのバグを見つけて修正してください：\n\n{{code}}\n\nエラーメッセージ：\n{{error}}",
        description: "バグを特定して修正します",
        variables: ["code", "error"],
        category: "コーディング",
        favorite: true,
      },
      {
        name: "文章要約",
        template: "以下の文章を{{length}}文字程度で要約してください：\n\n{{text}}",
        description: "長文を簡潔にまとめます",
        variables: ["text", "length"],
        category: "文章",
        favorite: false,
      },
      {
        name: "翻訳",
        template: "以下の文章を{{target_lang}}に翻訳してください：\n\n{{text}}",
        description: "多言語翻訳",
        variables: ["text", "target_lang"],
        category: "文章",
        favorite: false,
      },
      {
        name: "コード説明",
        template: "以下のコードを初心者向けに説明してください：\n\n{{code}}\n\n特に以下の点を詳しく：\n- 各行の処理内容\n- 使用されている技術\n- 実行結果",
        description: "コードを分かりやすく解説",
        variables: ["code"],
        category: "コーディング",
        favorite: false,
      },
      {
        name: "テストケース生成",
        template: "以下の関数のテストケースを生成してください：\n\n{{code}}\n\nフレームワーク：{{framework}}",
        description: "ユニットテストを自動生成",
        variables: ["code", "framework"],
        category: "コーディング",
        favorite: false,
      },
      {
        name: "ドキュメント生成",
        template: "以下のコードのドキュメントを生成してください：\n\n{{code}}\n\n形式：{{format}}（例：JSDoc, Markdown）",
        description: "コードドキュメントを自動生成",
        variables: ["code", "format"],
        category: "コーディング",
        favorite: false,
      },
      {
        name: "コード変換",
        template: "以下の{{source_lang}}のコードを{{target_lang}}に変換してください：\n\n{{code}}",
        description: "プログラミング言語間の変換",
        variables: ["code", "source_lang", "target_lang"],
        category: "コーディング",
        favorite: false,
      },
    ];

    defaults.forEach(template => {
      const id = `template-${Date.now()}-${Math.random()}`;
      this.templates.set(id, {
        ...template,
        id,
        createdAt: Date.now(),
        usageCount: 0,
      });
    });

    this.saveToIndexedDB();
  }

  /**
   * テンプレート追加
   */
  addTemplate(template: Omit<PromptTemplate, "id" | "createdAt" | "usageCount">): string {
    const id = `template-${Date.now()}-${Math.random()}`;
    const newTemplate: PromptTemplate = {
      ...template,
      id,
      createdAt: Date.now(),
      usageCount: 0,
    };

    this.templates.set(id, newTemplate);
    this.saveToIndexedDB();
    return id;
  }

  /**
   * テンプレート取得
   */
  getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * すべてのテンプレート取得
   */
  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values()).sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return b.usageCount - a.usageCount;
    });
  }

  /**
   * カテゴリでフィルタ
   */
  getTemplatesByCategory(category: string): PromptTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * お気に入りのみ取得
   */
  getFavoriteTemplates(): PromptTemplate[] {
    return this.getAllTemplates().filter(t => t.favorite);
  }

  /**
   * テンプレート適用（変数埋め込み）
   */
  applyTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) return "";

    let result = template.template;

    // 変数を埋め込み
    template.variables.forEach(varName => {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, "g");
      result = result.replace(regex, variables[varName] || "");
    });

    // 使用回数をインクリメント
    template.usageCount++;
    this.saveToIndexedDB();

    return result;
  }

  /**
   * テンプレート更新
   */
  updateTemplate(id: string, updates: Partial<PromptTemplate>): void {
    const template = this.templates.get(id);
    if (!template) return;

    this.templates.set(id, { ...template, ...updates });
    this.saveToIndexedDB();
  }

  /**
   * テンプレート削除
   */
  deleteTemplate(id: string): void {
    this.templates.delete(id);
    this.saveToIndexedDB();
  }

  /**
   * お気に入り切り替え
   */
  toggleFavorite(id: string): void {
    const template = this.templates.get(id);
    if (!template) return;

    template.favorite = !template.favorite;
    this.saveToIndexedDB();
  }

  /**
   * IndexedDBに保存
   */
  private async saveToIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["templates"], "readwrite");
        const store = transaction.objectStore("templates");

        store.clear();

        this.templates.forEach(template => {
          store.put(template);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("templates")) {
          db.createObjectStore("templates", { keyPath: "id" });
        }
      };
    });
  }

  /**
   * IndexedDBから読み込み
   */
  private async loadFromIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains("templates")) {
          resolve();
          return;
        }

        const transaction = db.transaction(["templates"], "readonly");
        const store = transaction.objectStore("templates");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const templates = getAllRequest.result as PromptTemplate[];
          templates.forEach(template => {
            this.templates.set(template.id, template);
          });
          resolve();
        };

        getAllRequest.onerror = () => reject(getAllRequest.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("templates")) {
          db.createObjectStore("templates", { keyPath: "id" });
        }
      };
    });
  }
}

export const promptTemplateManager = new PromptTemplateManager();
