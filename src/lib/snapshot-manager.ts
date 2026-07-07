/**
 * スナップショット管理
 * チャット状態を丸ごと保存・復元
 */

import { Message } from "../types";
import { ParsedFile } from "./file-handler";

export interface Snapshot {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  
  // チャット状態
  messages: Message[];
  currentModel: string | null;
  systemPrompt: string;
  
  // RAG状態
  attachedFiles: ParsedFile[];
  knowledgeIds: string[];
  
  // Artifact状態
  artifacts: any[];
  
  // メタデータ
  metadata: {
    messageCount: number;
    fileCount: number;
    totalTokens: number;
  };
}

export class SnapshotManager {
  private snapshots: Map<string, Snapshot> = new Map();
  private dbName = "Snapshots_DB";

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    await this.loadFromIndexedDB();
  }

  /**
   * スナップショット作成
   */
  async createSnapshot(
    name: string,
    description: string,
    state: {
      messages: Message[];
      currentModel: string | null;
      systemPrompt: string;
      attachedFiles: ParsedFile[];
      knowledgeIds: string[];
    }
  ): Promise<string> {
    const id = `snapshot-${Date.now()}-${Math.random()}`;
    
    // Artifactを収集
    const artifacts: any[] = [];
    state.messages.forEach(msg => {
      if (msg.artifacts) {
        artifacts.push(...msg.artifacts);
      }
    });

    const snapshot: Snapshot = {
      id,
      name,
      description,
      timestamp: Date.now(),
      messages: state.messages,
      currentModel: state.currentModel,
      systemPrompt: state.systemPrompt,
      attachedFiles: state.attachedFiles,
      knowledgeIds: state.knowledgeIds,
      artifacts,
      metadata: {
        messageCount: state.messages.length,
        fileCount: state.attachedFiles.length,
        totalTokens: this.estimateTokens(state.messages),
      },
    };

    this.snapshots.set(id, snapshot);
    await this.saveToIndexedDB();

    return id;
  }

  /**
   * スナップショット復元
   */
  getSnapshot(id: string): Snapshot | undefined {
    return this.snapshots.get(id);
  }

  /**
   * すべてのスナップショット取得
   */
  getAllSnapshots(): Snapshot[] {
    return Array.from(this.snapshots.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  /**
   * スナップショット削除
   */
  async deleteSnapshot(id: string): Promise<void> {
    this.snapshots.delete(id);
    await this.saveToIndexedDB();
  }

  /**
   * スナップショット更新
   */
  async updateSnapshot(id: string, updates: Partial<Snapshot>): Promise<void> {
    const snapshot = this.snapshots.get(id);
    if (!snapshot) return;

    this.snapshots.set(id, { ...snapshot, ...updates });
    await this.saveToIndexedDB();
  }

  /**
   * トークン数推定
   */
  private estimateTokens(messages: Message[]): number {
    let total = 0;
    messages.forEach(msg => {
      // 簡易的な推定: 1トークン ≈ 4文字
      total += Math.ceil(msg.content.length / 4);
    });
    return total;
  }

  /**
   * エクスポート（JSON）
   */
  exportSnapshot(id: string): string {
    const snapshot = this.snapshots.get(id);
    if (!snapshot) return "";

    return JSON.stringify(snapshot, null, 2);
  }

  /**
   * インポート（JSON）
   */
  async importSnapshot(jsonString: string): Promise<string> {
    try {
      const snapshot = JSON.parse(jsonString) as Snapshot;
      
      // 新しいIDを生成
      const newId = `snapshot-${Date.now()}-${Math.random()}`;
      snapshot.id = newId;
      snapshot.timestamp = Date.now();

      this.snapshots.set(newId, snapshot);
      await this.saveToIndexedDB();

      return newId;
    } catch (error) {
      throw new Error("スナップショットのインポートに失敗しました");
    }
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
        const transaction = db.transaction(["snapshots"], "readwrite");
        const store = transaction.objectStore("snapshots");

        store.clear();

        this.snapshots.forEach(snapshot => {
          store.put(snapshot);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("snapshots")) {
          db.createObjectStore("snapshots", { keyPath: "id" });
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
        
        if (!db.objectStoreNames.contains("snapshots")) {
          resolve();
          return;
        }

        const transaction = db.transaction(["snapshots"], "readonly");
        const store = transaction.objectStore("snapshots");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const snapshots = getAllRequest.result as Snapshot[];
          snapshots.forEach(snapshot => {
            this.snapshots.set(snapshot.id, snapshot);
          });
          resolve();
        };

        getAllRequest.onerror = () => reject(getAllRequest.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("snapshots")) {
          db.createObjectStore("snapshots", { keyPath: "id" });
        }
      };
    });
  }
}

export const snapshotManager = new SnapshotManager();
