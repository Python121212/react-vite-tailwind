/**
 * WebRTC P2P通信マネージャー
 * スマホ間でAIモデルと学習データを共有
 */

import Peer, { DataConnection } from "peerjs";

export interface SharedData {
  type: "model" | "knowledge" | "chat" | "settings";
  data: any;
  timestamp: number;
  size: number;
}

export interface PeerInfo {
  id: string;
  connected: boolean;
  connectedAt?: number;
}

export class P2PManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private onDataCallbacks: Set<(data: SharedData, peerId: string) => void> = new Set();
  private onConnectionCallbacks: Set<(peerId: string, connected: boolean) => void> = new Set();
  private myPeerId: string | null = null;

  /**
   * P2P初期化
   */
  async initialize(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // PeerJS サーバーに接続（公開サーバー使用）
        this.peer = new Peer({
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          },
        });

        this.peer.on("open", (id) => {
          this.myPeerId = id;
          console.log("✅ P2P接続準備完了。Peer ID:", id);
          resolve(id);
        });

        this.peer.on("error", (error) => {
          console.error("❌ P2Pエラー:", error);
          reject(error);
        });

        // 接続受信
        this.peer.on("connection", (conn) => {
          this.handleConnection(conn);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 他の端末に接続
   */
  async connectToPeer(peerId: string): Promise<void> {
    if (!this.peer) {
      throw new Error("P2Pが初期化されていません");
    }

    return new Promise((resolve, reject) => {
      try {
        const conn = this.peer!.connect(peerId, {
          reliable: true,
          serialization: "json",
        });

        conn.on("open", () => {
          console.log("✅ 接続成功:", peerId);
          this.handleConnection(conn);
          resolve();
        });

        conn.on("error", (error) => {
          console.error("❌ 接続エラー:", error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 接続処理
   */
  private handleConnection(conn: DataConnection): void {
    const peerId = conn.peer;
    this.connections.set(peerId, conn);

    // 接続イベント
    this.onConnectionCallbacks.forEach((cb) => cb(peerId, true));

    // データ受信
    conn.on("data", (data) => {
      const sharedData = data as SharedData;
      console.log("📥 データ受信:", sharedData.type, "from", peerId);
      this.onDataCallbacks.forEach((cb) => cb(sharedData, peerId));
    });

    // 切断
    conn.on("close", () => {
      console.log("🔌 切断:", peerId);
      this.connections.delete(peerId);
      this.onConnectionCallbacks.forEach((cb) => cb(peerId, false));
    });

    // エラー
    conn.on("error", (error) => {
      console.error("❌ 接続エラー:", peerId, error);
      this.connections.delete(peerId);
      this.onConnectionCallbacks.forEach((cb) => cb(peerId, false));
    });
  }

  /**
   * データ送信
   */
  async sendData(peerId: string, data: SharedData): Promise<void> {
    const conn = this.connections.get(peerId);
    if (!conn) {
      throw new Error(`接続が見つかりません: ${peerId}`);
    }

    return new Promise((resolve, reject) => {
      try {
        conn.send(data);
        console.log("📤 データ送信:", data.type, "to", peerId);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * すべての接続にブロードキャスト
   */
  async broadcast(data: SharedData): Promise<void> {
    const promises: Promise<void>[] = [];
    
    this.connections.forEach((_connection, peerId) => {
      promises.push(this.sendData(peerId, data));
    });

    await Promise.all(promises);
  }

  /**
   * AIモデルを送信
   */
  async shareModel(peerId: string, modelData: ArrayBuffer, modelId: string): Promise<void> {
    // 大きなデータはチャンク分割して送信
    const chunkSize = 16 * 1024; // 16KB
    const totalChunks = Math.ceil(modelData.byteLength / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, modelData.byteLength);
      const chunk = modelData.slice(start, end);

      const data: SharedData = {
        type: "model",
        data: {
          modelId,
          chunk: Array.from(new Uint8Array(chunk)),
          chunkIndex: i,
          totalChunks,
        },
        timestamp: Date.now(),
        size: chunk.byteLength,
      };

      await this.sendData(peerId, data);

      // 進捗表示用
      const progress = ((i + 1) / totalChunks) * 100;
      console.log(`📤 モデル送信中: ${progress.toFixed(1)}%`);
    }

    console.log("✅ モデル送信完了:", modelId);
  }

  /**
   * 学習データを送信
   */
  async shareKnowledge(peerId: string, knowledgeData: any[]): Promise<void> {
    const data: SharedData = {
      type: "knowledge",
      data: knowledgeData,
      timestamp: Date.now(),
      size: JSON.stringify(knowledgeData).length,
    };

    await this.sendData(peerId, data);
  }

  /**
   * チャット履歴を送信
   */
  async shareChat(peerId: string, chatHistory: any[]): Promise<void> {
    const data: SharedData = {
      type: "chat",
      data: chatHistory,
      timestamp: Date.now(),
      size: JSON.stringify(chatHistory).length,
    };

    await this.sendData(peerId, data);
  }

  /**
   * 設定を送信
   */
  async shareSettings(peerId: string, settings: any): Promise<void> {
    const data: SharedData = {
      type: "settings",
      data: settings,
      timestamp: Date.now(),
      size: JSON.stringify(settings).length,
    };

    await this.sendData(peerId, data);
  }

  /**
   * データ受信リスナー登録
   */
  onData(callback: (data: SharedData, peerId: string) => void): void {
    this.onDataCallbacks.add(callback);
  }

  /**
   * データ受信リスナー解除
   */
  offData(callback: (data: SharedData, peerId: string) => void): void {
    this.onDataCallbacks.delete(callback);
  }

  /**
   * 接続状態リスナー登録
   */
  onConnection(callback: (peerId: string, connected: boolean) => void): void {
    this.onConnectionCallbacks.add(callback);
  }

  /**
   * 接続状態リスナー解除
   */
  offConnection(callback: (peerId: string, connected: boolean) => void): void {
    this.onConnectionCallbacks.delete(callback);
  }

  /**
   * 自分のPeer ID取得
   */
  getMyPeerId(): string | null {
    return this.myPeerId;
  }

  /**
   * 接続中のPeer一覧取得
   */
  getConnectedPeers(): PeerInfo[] {
    const peers: PeerInfo[] = [];
    
    this.connections.forEach((connection, peerId) => {
      peers.push({
        id: peerId,
        connected: connection.open,
        connectedAt: Date.now(),
      });
    });

    return peers;
  }

  /**
   * 切断
   */
  disconnect(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
    }
  }

  /**
   * すべて切断
   */
  disconnectAll(): void {
    this.connections.forEach((connection) => {
      connection.close();
    });
    this.connections.clear();
  }

  /**
   * P2P終了
   */
  destroy(): void {
    this.disconnectAll();
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.myPeerId = null;
    this.onDataCallbacks.clear();
    this.onConnectionCallbacks.clear();
  }
}

export const p2pManager = new P2PManager();
