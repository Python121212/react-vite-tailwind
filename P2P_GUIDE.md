# P2P デバイス間共有ガイド

## 🔗 概要

WebRTCを使用したブラウザ間の直接通信により、以下を実現：

1. **AIモデルの共有**: ダウンロード済みモデルを他の端末へ転送
2. **学習データの共有**: バックグラウンド学習データを同期
3. **チャット履歴の共有**: 会話を他のデバイスで継続
4. **設定の共有**: システムプロンプトや設定を同期

## 🚀 セットアップ

### 1. P2P接続の初期化

```typescript
// P2Pマネージャーを初期化
const peerId = await p2pManager.initialize();
console.log("あなたのPeer ID:", peerId);
```

初期化すると、自動的に以下が行われます：
- PeerJSサーバーへ接続
- 一意のPeer IDを取得
- WebRTC用のICEサーバー設定
- 接続受付状態になる

### 2. QRコード生成

```typescript
// 接続情報をQRコード化
const qrCode = await qrManager.generateConnectionQR(
  peerId,
  currentModelId // オプション: モデルIDも含める
);

// QRコードを表示
<img src={qrCode} alt="Connection QR Code" />
```

QRコードには以下の情報が含まれます：
```json
{
  "peerId": "abc123xyz...",
  "modelId": "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  "timestamp": 1234567890,
  "version": "1.0"
}
```

### 3. 接続方法（3つ）

#### 方法A: QRコードスキャン（推奨）

```typescript
// カメラを起動
const stream = await qrManager.startCameraStream(videoElement);

// QRコードを検出
await qrManager.readQRFromStream(
  videoElement,
  async (data) => {
    // 自動的にPeer IDで接続
    await p2pManager.connectToPeer(data.peerId);
    console.log("接続成功！");
  }
);
```

#### 方法B: 手動Peer ID入力

```typescript
// Peer IDを直接入力
await p2pManager.connectToPeer("abc123xyz...");
```

#### 方法C: QRコード画像ファイル

```typescript
// 画像ファイルから読み取り
const data = await qrManager.readQRFromFile(imageFile);
if (data) {
  await p2pManager.connectToPeer(data.peerId);
}
```

## 📤 データ共有

### AIモデルの共有

```typescript
// モデルデータを準備（ArrayBuffer）
const modelData = await fetchModelData(modelId);

// チャンク分割して送信（16KB単位）
await p2pManager.shareModel(
  targetPeerId,
  modelData,
  modelId
);
```

**送信プロセス：**
1. モデルデータを16KBチャンクに分割
2. 各チャンクを順次送信
3. 進捗表示（0-100%）
4. 完了通知

**受信側の処理：**
```typescript
p2pManager.onData((data, peerId) => {
  if (data.type === "model") {
    const { chunk, chunkIndex, totalChunks, modelId } = data.data;
    
    // チャンクを結合
    chunks[chunkIndex] = chunk;
    
    // すべて受信したら
    if (Object.keys(chunks).length === totalChunks) {
      const fullModel = mergeChunks(chunks);
      await loadModel(modelId, fullModel);
      console.log("モデルのロード完了！");
    }
  }
});
```

### 学習データの共有

```typescript
// バックグラウンド学習データを取得
const knowledge = await backgroundLearning.getAllKnowledge();

// 送信
await p2pManager.shareKnowledge(targetPeerId, knowledge);
```

受信側：
```typescript
p2pManager.onData(async (data, peerId) => {
  if (data.type === "knowledge") {
    // 受信データをIndexedDBに保存
    for (const entry of data.data) {
      await backgroundLearning.saveKnowledge(entry);
    }
    console.log(`${data.data.length}件の知識を受信`);
  }
});
```

### チャット履歴の共有

```typescript
// 現在のセッションを取得
const session = await storage.getChatSession(sessionId);

// 送信
await p2pManager.shareChat(targetPeerId, session.messages);
```

### 設定の共有

```typescript
// 設定オブジェクト
const settings = {
  systemPrompt: "あなたは...",
  modelId: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  powerMode: "balanced",
  theme: "dark",
};

// 送信
await p2pManager.shareSettings(targetPeerId, settings);
```

## 🔄 接続管理

### 接続状態の監視

```typescript
// 接続イベントリスナー
p2pManager.onConnection((peerId, connected) => {
  if (connected) {
    console.log(`✅ ${peerId}が接続しました`);
    // UI更新: 接続デバイス一覧に追加
  } else {
    console.log(`❌ ${peerId}が切断しました`);
    // UI更新: 接続デバイス一覧から削除
  }
});
```

### 接続中のデバイス一覧

```typescript
const peers = p2pManager.getConnectedPeers();

peers.forEach(peer => {
  console.log(`ID: ${peer.id}`);
  console.log(`接続状態: ${peer.connected}`);
  console.log(`接続時刻: ${peer.connectedAt}`);
});
```

### 切断

```typescript
// 特定のPeerを切断
p2pManager.disconnect(peerId);

// すべて切断
p2pManager.disconnectAll();

// P2Pシステムを完全終了
p2pManager.destroy();
```

## 📱 実際の使用例

### シナリオ1: スマホA → スマホB にモデル転送

**スマホA（送信側）:**
```typescript
// 1. P2P初期化
const myPeerId = await p2pManager.initialize();

// 2. QRコード生成・表示
const qr = await qrManager.generateConnectionQR(
  myPeerId,
  "Llama-3.2-3B-Instruct-q4f16_1-MLC"
);
displayQR(qr);

// 3. 接続を待つ
p2pManager.onConnection(async (peerId, connected) => {
  if (connected) {
    alert("スマホBが接続しました！");
    
    // 4. モデル送信
    const modelData = await getLoadedModel();
    await p2pManager.shareModel(
      peerId,
      modelData,
      "Llama-3.2-3B-Instruct-q4f16_1-MLC"
    );
  }
});
```

**スマホB（受信側）:**
```typescript
// 1. P2P初期化
await p2pManager.initialize();

// 2. QRコードスキャン
const stream = await qrManager.startCameraStream(video);
await qrManager.readQRFromStream(video, async (data) => {
  // 3. 自動接続
  await p2pManager.connectToPeer(data.peerId);
  
  qrManager.stopCameraStream(stream);
  alert("接続成功！モデル受信を開始します");
});

// 4. モデル受信
const modelChunks = [];
p2pManager.onData(async (data) => {
  if (data.type === "model") {
    const { chunk, chunkIndex, totalChunks } = data.data;
    
    modelChunks[chunkIndex] = chunk;
    
    const progress = (Object.keys(modelChunks).length / totalChunks) * 100;
    updateProgress(progress);
    
    if (Object.keys(modelChunks).length === totalChunks) {
      const fullModel = mergeChunks(modelChunks);
      await loadModelDirectly(fullModel);
      alert("モデルのロード完了！ダウンロード不要で使用できます");
    }
  }
});
```

### シナリオ2: 学習データの同期

```typescript
// デバイスA: 最新の学習データを取得
const knowledge = await backgroundLearning.getAllKnowledge();
console.log(`${knowledge.length}件の知識を共有`);

// デバイスBに送信
await p2pManager.shareKnowledge(deviceB_PeerId, knowledge);

// デバイスB: 受信して保存
p2pManager.onData(async (data) => {
  if (data.type === "knowledge") {
    for (const entry of data.data) {
      await backgroundLearning.saveKnowledge(entry);
    }
    alert("学習データの同期完了！");
  }
});
```

### シナリオ3: チャット履歴の引き継ぎ

```typescript
// PCからスマホへチャット履歴を転送

// PC側
const session = await storage.getChatSession(currentSessionId);
await p2pManager.shareChat(smartphonePeerId, session.messages);

// スマホ側
p2pManager.onData(async (data) => {
  if (data.type === "chat") {
    const newSession = {
      id: `session-${Date.now()}`,
      title: "PCから転送",
      messages: data.data,
      timestamp: Date.now(),
    };
    
    await storage.saveChatSession(newSession);
    alert("チャット履歴をインポートしました！");
  }
});
```

## 🔒 セキュリティ

### データ暗号化（推奨実装）

```typescript
// 暗号化ユーティリティ
async function encryptData(data: any, password: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("salt"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(data))
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
}

// 使用例
const encryptedModel = await encryptData(modelData, "password123");
await p2pManager.shareModel(peerId, encryptedModel, modelId);
```

### 接続認証（推奨実装）

```typescript
// トークンベース認証
const connectionToken = generateSecureToken();

const qr = await qrManager.generateConnectionQR(myPeerId, modelId);
// QRコードにトークンを含める

// 接続時に検証
p2pManager.onConnection((peerId, connected) => {
  if (connected) {
    // トークン検証リクエスト
    p2pManager.sendData(peerId, {
      type: "auth",
      token: connectionToken,
      timestamp: Date.now()
    });
  }
});
```

## ⚡ パフォーマンス最適化

### チャンクサイズの調整

```typescript
// ネットワーク状況に応じて調整
const chunkSize = navigator.connection?.effectiveType === "4g"
  ? 64 * 1024  // 4G: 64KB
  : 16 * 1024; // それ以外: 16KB
```

### 圧縮

```typescript
// データ圧縮（CompressionStream API）
async function compressData(data: string): Promise<ArrayBuffer> {
  const stream = new Blob([data])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  
  return new Response(stream).arrayBuffer();
}
```

## 🐛 トラブルシューティング

### 接続できない

1. **ファイアウォール確認**: WebRTC用ポート（UDP）が開いているか
2. **STUN/TURNサーバー**: ICEサーバー設定を確認
3. **ブラウザ権限**: カメラ・マイク権限が許可されているか

### データが届かない

1. **接続状態確認**: `getConnectedPeers()`で確認
2. **データサイズ**: 大きすぎる場合はチャンク分割
3. **シリアライズ**: 送信データがJSON化可能か確認

### QRコードがスキャンできない

1. **カメラ権限**: MediaDevices APIの権限を確認
2. **照明**: QRコードが鮮明に見えるか
3. **エラーコレクション**: QRコード生成時のレベルを"H"に

---

**P2P通信で、AIモデルと学習データをスマホ間で自由に共有！ダウンロード不要で即座に利用開始できます。** 🚀
