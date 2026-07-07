/**
 * バックグラウンド学習システム
 * オンライン時に最新情報を自動収集・ベクトル化
 */

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  timestamp: number;
  embedding?: number[];
}

export class BackgroundLearningEngine {
  private isLearning = false;
  private learningInterval: NodeJS.Timeout | null = null;
  private knowledgeDB: IDBDatabase | null = null;

  /**
   * 学習エンジン初期化
   */
  async initialize(): Promise<void> {
    await this.initDatabase();
  }

  /**
   * IndexedDB初期化
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("BackgroundKnowledge_DB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.knowledgeDB = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("knowledge")) {
          const store = db.createObjectStore("knowledge", { keyPath: "id" });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("category", "category", { unique: false });
          store.createIndex("source", "source", { unique: false });
        }
      };
    });
  }

  /**
   * バックグラウンド学習開始
   */
  startLearning(intervalMinutes: number = 30): void {
    if (this.isLearning) return;

    this.isLearning = true;
    console.log("🎓 バックグラウンド学習を開始しました");

    // 即座に1回実行
    this.collectKnowledge();

    // 定期実行
    this.learningInterval = setInterval(() => {
      this.collectKnowledge();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * バックグラウンド学習停止
   */
  stopLearning(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }
    this.isLearning = false;
    console.log("🎓 バックグラウンド学習を停止しました");
  }

  /**
   * 知識収集メイン処理
   */
  private async collectKnowledge(): Promise<void> {
    if (!navigator.onLine) {
      console.log("オフラインのため学習をスキップ");
      return;
    }

    console.log("🔍 最新情報を収集中...");

    try {
      // 複数ソースから情報収集
      await Promise.all([
        this.fetchTechNews(),
        this.fetchSportsNews(),
        this.fetchGeneralNews(),
        this.fetchWikipediaTrending(),
      ]);

      console.log("✅ 知識収集完了");
    } catch (error) {
      console.error("知識収集エラー:", error);
    }
  }

  /**
   * 技術ニュース収集
   */
  private async fetchTechNews(): Promise<void> {
    try {
      // GitHub Trending APIから最新のトレンド取得
      const response = await fetch(
        "https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=10"
      );

      if (!response.ok) throw new Error("GitHub API エラー");

      const data = await response.json();

      for (const repo of data.items || []) {
        const entry: KnowledgeEntry = {
          id: `github-${repo.id}`,
          title: repo.full_name,
          content: `${repo.description || "説明なし"}\n言語: ${repo.language || "不明"}\nスター数: ${repo.stargazers_count}`,
          source: "GitHub Trending",
          category: "技術",
          timestamp: Date.now(),
        };

        await this.saveKnowledge(entry);
      }
    } catch (error) {
      console.error("技術ニュース収集エラー:", error);
    }
  }

  /**
   * スポーツニュース収集
   */
  private async fetchSportsNews(): Promise<void> {
    try {
      // NewsAPI (無料版)を使用
      // 実際のAPIキーは環境変数から取得することを推奨
      const apiKey = "demo"; // デモ用、実際には適切なキーを使用

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=sports&language=jp&pageSize=5&apiKey=${apiKey}`
      );

      if (!response.ok) {
        console.log("NewsAPI利用不可（デモキー）");
        return;
      }

      const data = await response.json();

      for (const article of data.articles || []) {
        const entry: KnowledgeEntry = {
          id: `news-sports-${Date.now()}-${Math.random()}`,
          title: article.title,
          content: article.description || article.content || "",
          source: "NewsAPI - Sports",
          category: "スポーツ",
          timestamp: Date.now(),
        };

        await this.saveKnowledge(entry);
      }
    } catch (error) {
      console.error("スポーツニュース収集エラー:", error);
    }
  }

  /**
   * 一般ニュース収集
   */
  private async fetchGeneralNews(): Promise<void> {
    try {
      // HackerNews APIから最新ニュース取得
      const response = await fetch(
        "https://hacker-news.firebaseio.com/v0/topstories.json"
      );

      if (!response.ok) throw new Error("HackerNews API エラー");

      const storyIds = await response.json();

      // 上位5件のみ取得
      for (let i = 0; i < Math.min(5, storyIds.length); i++) {
        const storyResponse = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${storyIds[i]}.json`
        );

        const story = await storyResponse.json();

        const entry: KnowledgeEntry = {
          id: `hn-${story.id}`,
          title: story.title,
          content: story.text || story.url || "",
          source: "HackerNews",
          category: "技術・ニュース",
          timestamp: Date.now(),
        };

        await this.saveKnowledge(entry);
      }
    } catch (error) {
      console.error("一般ニュース収集エラー:", error);
    }
  }

  /**
   * Wikipedia トレンド収集
   */
  private async fetchWikipediaTrending(): Promise<void> {
    try {
      // Wikipedia Most Read Articles API
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      const response = await fetch(
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/ja.wikipedia/all-access/${year}/${month}/${day}`
      );

      if (!response.ok) {
        console.log("Wikipedia API利用不可");
        return;
      }

      const data = await response.json();

      const articles = data.items?.[0]?.articles || [];

      for (let i = 0; i < Math.min(5, articles.length); i++) {
        const article = articles[i];

        const entry: KnowledgeEntry = {
          id: `wiki-${article.article}-${Date.now()}`,
          title: article.article,
          content: `閲覧数: ${article.views}\nランク: ${article.rank}`,
          source: "Wikipedia Trending",
          category: "トレンド",
          timestamp: Date.now(),
        };

        await this.saveKnowledge(entry);
      }
    } catch (error) {
      console.error("Wikipediaトレンド収集エラー:", error);
    }
  }

  /**
   * 知識をデータベースに保存
   */
  private async saveKnowledge(entry: KnowledgeEntry): Promise<void> {
    if (!this.knowledgeDB) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.knowledgeDB!.transaction(["knowledge"], "readwrite");
      const store = transaction.objectStore("knowledge");
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 関連知識を検索
   */
  async searchKnowledge(query: string, limit: number = 5): Promise<KnowledgeEntry[]> {
    if (!this.knowledgeDB) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.knowledgeDB!.transaction(["knowledge"], "readonly");
      const store = transaction.objectStore("knowledge");
      const request = store.getAll();

      request.onsuccess = () => {
        const allEntries: KnowledgeEntry[] = request.result || [];

        // シンプルなテキストマッチング（本来はベクトル検索を使用）
        const queryLower = query.toLowerCase();
        const matches = allEntries
          .filter(
            (entry) =>
              entry.title.toLowerCase().includes(queryLower) ||
              entry.content.toLowerCase().includes(queryLower)
          )
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);

        resolve(matches);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * すべての知識を取得
   */
  async getAllKnowledge(): Promise<KnowledgeEntry[]> {
    if (!this.knowledgeDB) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.knowledgeDB!.transaction(["knowledge"], "readonly");
      const store = transaction.objectStore("knowledge");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 知識データベースをクリア
   */
  async clearKnowledge(): Promise<void> {
    if (!this.knowledgeDB) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.knowledgeDB!.transaction(["knowledge"], "readwrite");
      const store = transaction.objectStore("knowledge");
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 学習中かどうか
   */
  isCurrentlyLearning(): boolean {
    return this.isLearning;
  }

  /**
   * 知識カウント取得
   */
  async getKnowledgeCount(): Promise<number> {
    if (!this.knowledgeDB) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.knowledgeDB!.transaction(["knowledge"], "readonly");
      const store = transaction.objectStore("knowledge");
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// シングルトンインスタンス
export const backgroundLearning = new BackgroundLearningEngine();
