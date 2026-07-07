# PWA (Progressive Web App) ガイド

## 🚀 概要

このアプリは完全なPWA対応により、以下を実現：

1. **オフライン動作**: インターネット接続なしで全機能利用可能
2. **ホーム画面追加**: アプリのようにインストール
3. **高速起動**: キャッシュによる即座のロード
4. **自動更新**: 新バージョンを自動検出・適用
5. **通知機能**: 重要なイベントを通知

## 📱 インストール方法

### Android (Chrome)

1. アプリを開く
2. 画面下部に「ホーム画面に追加」プロンプトが表示
3. 「インストール」をタップ
4. ホーム画面にアイコンが追加されます

または：

1. メニュー（⋮）を開く
2. 「ホーム画面に追加」を選択
3. 「追加」をタップ

### iOS (Safari)

1. Safariでアプリを開く
2. 共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

### デスクトップ (Chrome/Edge)

1. アドレスバー右側のインストールアイコン（⊕）をクリック
2. 「インストール」をクリック
3. スタンドアロンウィンドウで起動

## 🔄 Service Worker

### 機能

Service Workerは以下を提供：

```typescript
// 自動登録
registerServiceWorker();

// キャッシュ戦略
{
  // CDNリソース: Cache First（1年）
  jsdelivr: "CacheFirst",
  
  // AIモデル: Cache First（30日）
  mlcAI: "CacheFirst",
  
  // 静的アセット: すべてプリキャッシュ
  assets: "precache"
}
```

### キャッシュ管理

#### 自動キャッシュ

以下は自動的にキャッシュされます：

- HTML, CSS, JavaScript
- アイコン、画像
- フォントファイル
- AIモデルデータ（最大50MB）

#### キャッシュクリア

```javascript
// Service Workerを手動で削除
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});

// キャッシュストレージをクリア
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

## 📴 オフライン機能

### オフラインで利用可能な機能

✅ **すべて利用可能**:
- AIチャット（モデル読み込み済みの場合）
- ファイル添付・解析
- チャット履歴の閲覧・編集
- コードエディタ
- プロンプトテンプレート
- スナップショット管理
- OPFS ファイル管理

❌ **オフライン時に制限される機能**:
- 新規モデルのダウンロード
- バックグラウンド学習（外部API）
- P2P接続の新規確立（既存接続は維持）

### オフライン検出

```typescript
// オンライン状態チェック
const isOnline = navigator.onLine;

// イベントリスナー
window.addEventListener('online', () => {
  console.log('オンラインに復帰');
});

window.addEventListener('offline', () => {
  console.log('オフラインモード');
});
```

アプリは自動的にオフライン状態を検出し、画面上部に通知バーを表示します：

```
📴 オフラインモード - すべての機能が利用可能です
```

## 🔔 通知機能

### 通知の種類

1. **オフライン/オンライン切り替え**
   ```
   タイトル: "オフライン"
   本文: "オフラインモードで動作しています"
   ```

2. **PWAインストール完了**
   ```
   タイトル: "オフライン対応完了"
   本文: "アプリをオフラインでも使用できます"
   ```

3. **P2Pデータ受信**
   ```
   タイトル: "データ受信"
   本文: "{peerId}から{type}を受信しました"
   ```

4. **新バージョン利用可能**
   ```
   タイトル: "アップデート"
   本文: "新しいバージョンが利用可能です"
   ```

### 通知権限の要求

```typescript
// 通知権限をリクエスト
if ('Notification' in window && Notification.permission === 'default') {
  await Notification.requestPermission();
}

// 通知を送信
if (Notification.permission === 'granted') {
  new Notification('タイトル', {
    body: '本文',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200]
  });
}
```

## ⚙️ PWA設定

### Manifest (manifest.json)

```json
{
  "name": "次世代型ローカルAI - WebLLM",
  "short_name": "ローカルAI",
  "description": "完全ブラウザ内で動作する高性能AIチャットシステム",
  "theme_color": "#667eea",
  "background_color": "#f8f9fa",
  "display": "standalone",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "新しいチャット",
      "url": "/?action=new"
    }
  ]
}
```

### テーマカラー

アプリのテーマカラーは `#667eea`（紫-青グラデーション）です。

これはシステムUIに反映されます：
- Androidのナビゲーションバー
- iOSのステータスバー
- デスクトップのタイトルバー

## 🔄 アップデート管理

### 自動更新

Service Workerは1時間ごとに更新をチェック：

```typescript
setInterval(() => {
  registration?.update();
}, 60 * 60 * 1000);
```

### 手動更新

新バージョンが検出されると、確認ダイアログが表示：

```
新しいバージョンが利用可能です。更新しますか？
[OK] [キャンセル]
```

「OK」を選択すると即座にアップデート適用。

### 強制リロード

```typescript
// ページリロード
window.location.reload();

// Service Workerスキップ待機
if (registration.waiting) {
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}
```

## 📊 ストレージ管理

### 使用量確認

```typescript
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  
  console.log('使用量:', estimate.usage, 'bytes');
  console.log('上限:', estimate.quota, 'bytes');
  console.log('使用率:', (estimate.usage / estimate.quota * 100).toFixed(2), '%');
}
```

### ストレージの種類

1. **Cache Storage** (Service Worker)
   - 静的アセット
   - CDNリソース
   - AIモデル

2. **IndexedDB**
   - チャット履歴
   - 学習データ
   - スナップショット
   - プロンプトテンプレート

3. **OPFS**
   - ユーザーファイル
   - ドキュメント

### クリーンアップ

設定メニューから「すべて削除」を実行すると：

```typescript
// IndexedDB削除
await storage.clearAllData();

// OPFS削除
await opfsStorage.clearAll();

// キャッシュ削除
const keys = await caches.keys();
await Promise.all(keys.map(key => caches.delete(key)));
```

## 🔒 セキュリティ

### HTTPS必須

PWAはHTTPS環境でのみ動作します：

- 本番環境: `https://your-domain.com`
- 開発環境: `http://localhost` (例外的に許可)

### 権限

PWAが要求する権限：

1. **通知**: オプション（推奨）
2. **カメラ**: QRスキャン時のみ
3. **ストレージ**: 自動的に許可

## 🎯 ベストプラクティス

### 1. オフライン優先設計

```typescript
// ネットワークを試してからキャッシュにフォールバック
async function fetchWithFallback(url) {
  try {
    const response = await fetch(url);
    return response;
  } catch (error) {
    // オフライン時はキャッシュから取得
    const cache = await caches.open('offline-cache');
    return cache.match(url);
  }
}
```

### 2. 段階的機能強化

```typescript
// Service Worker対応チェック
if ('serviceWorker' in navigator) {
  registerServiceWorker();
} else {
  console.warn('Service Worker非対応');
  // 基本機能は動作
}
```

### 3. ユーザーフィードバック

```typescript
// ローディング状態を表示
const updateSW = registerSW({
  onNeedRefresh() {
    showUpdatePrompt();
  },
  onOfflineReady() {
    showOfflineNotice();
  }
});
```

## 🐛 トラブルシューティング

### Service Workerが登録されない

1. **HTTPSチェック**: `https://` で開いているか確認
2. **ブラウザ対応**: Chrome 40+, Firefox 44+, Safari 11.1+
3. **コンソールエラー**: DevToolsでエラー確認

### キャッシュが更新されない

```typescript
// 強制更新
navigator.serviceWorker.getRegistration().then(reg => {
  reg?.update();
});

// または、キャッシュバージョンを変更
const CACHE_VERSION = 'v2'; // v1 から v2 へ
```

### オフライン時にエラー

1. **必要なリソース確認**: すべてキャッシュされているか
2. **IndexedDB**: データが保存されているか
3. **ネットワークエラーハンドリング**: try-catch追加

### アイコンが表示されない

1. **パス確認**: `/icon-192.png` が存在するか
2. **形式確認**: PNG形式か
3. **サイズ確認**: 192x192, 512x512 の2種類

## 📈 パフォーマンス

### Lighthouse スコア目標

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+
- **PWA**: 100

### 最適化Tips

1. **プリキャッシュ最小化**: 必要最小限のリソースのみ
2. **遅延ロード**: 初期表示に不要なものは後で
3. **圧縮**: Gzip/Brotli圧縮を有効化
4. **CDN**: 静的アセットはCDN配信

---

**完全オフライン対応PWA。インストールして、いつでもどこでもAIチャットを楽しもう！** 📱✨
