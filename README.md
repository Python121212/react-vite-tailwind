# 次世代型ローカルAIアプリケーション

完全ブラウザ内で動作する超高機能AIチャットシステム。WebGPU推論、OPFS永続化、Chain-of-Thought可視化、会話分岐、RAG統合など、最先端技術を結集。

## 🚀 主要機能

### 🤖 120種類以上のAIモデル
- **自動モデル選択**: タスクに応じて最適なモデルを自動選択
- **カテゴリ別**: 汎用/コーディング/数学/軽量モデル
- **検索機能**: モデル名で素早く検索
- **推奨マーク**: 初心者向けモデルを明示

### 🧠 Chain-of-Thought (CoT) 可視化
- AI の思考プロセスをステップバイステップで表示
- 折りたたみ可能なUI
- 各ステップのタイムスタンプ表示
- アニメーション付き視覚的フィードバック

### 📱 OPFS (Origin Private File System)
- ブラウザ専用の高速ファイルシステム
- スマホ内の全ファイルを認識・記憶
- ディレクトリ階層サポート
- 高速な検索・呼び出し機能
- ストレージ使用量監視

### 📚 高度なRAGシステム
- **ファイル自動解析**: 100種類以上の拡張子対応
- **タグUI**: 参照中のファイルを視覚的に表示
- **クリックでON/OFF**: 不要なファイルを簡単に除外
- **アクティブファイル数表示**: リアルタイム管理
- ベクトル検索（Transformers.js統合予定）

### 🌿 会話分岐システム
- **ツリー構造**: 複数ブランチの会話管理
- **「ここから別ルート」**: 任意のメッセージから分岐
- 履歴を汚さずに試行錯誤
- ブランチ数の可視化

### 📋 プロンプトテンプレート
- **変数埋め込み**: `{{変数名}}` 形式
- **8種類のデフォルトテンプレート**:
  - コードリファクタリング
  - バグ修正
  - 文章要約
  - 翻訳
  - コード説明
  - テストケース生成
  - ドキュメント生成
  - コード変換
- お気に入り機能
- 使用回数トラッキング
- カスタムテンプレート追加可能

### 📝 簡易コードエディタ
- シンタックスハイライト風UI
- 行番号表示
- **AI解析**: コードを送信して解析依頼
- **AI書き直し**: リファクタリング依頼
- 自動フォーマット（インデント整理）
- コピー・ダウンロード機能

### 📸 スナップショット機能
- **完全な状態保存**:
  - チャット履歴
  - モデル設定
  - システムプロンプト
  - RAG参照ファイル
  - Artifact状態
- JSON エクスポート/インポート
- メタデータ（メッセージ数、ファイル数、トークン数）

### 🎨 背景カスタマイズ
- **カスタム画像アップロード**: jpg, png, gif, webp
- **9種類のプリセットグラデーション**
- **アニメーションGIF対応**
- **GPU/CPU負荷ゼロ**: 静的CSSで実装
- LocalStorage で設定保存

### 🎓 バックグラウンド学習
- **自動情報収集**:
  - GitHub Trending
  - HackerNews
  - Wikipedia Trending
  - NewsAPI（スポーツ・一般）
- 30分間隔で自動更新
- IndexedDB で永続化
- 関連知識の自動注入

### 🔋 省エネ管理
- **3つのモード**:
  - ⚡ パフォーマンス (100 tok/s)
  - ⚖️ バランス (50 tok/s)
  - 🔋 省エネ (20 tok/s)
- Battery API 連携
- バッテリー残量で自動切替
- GPU使用率制限
- UI更新スロットリング

### 📁 ユニバーサル・ファイルハンドリング
- **すべての拡張子対応**:
  - プログラミング: 50種類以上
  - ドキュメント: md, txt, pdf など
  - データ: json, xml, yaml, csv など
  - 実行ファイル: exe, dll, so など
  - アーカイブ: zip, tar, gz など
  - 画像/動画/音声: すべて対応
- 自動メタデータ抽出
- バイナリファイル対応
- Base64エンコード

### 🎯 AI自動モデル選択
- **タスク分析**:
  - 簡単な挨拶 → 超軽量モデル
  - プログラミング → コーディング特化
  - 論理的思考 → 高性能モデル
  - 翻訳 → 多言語モデル
  - クリエイティブ → バランス型
- カスタムルール（正規表現）
- 複雑度推定（low/medium/high）

### 📊 Artifact システム
- **自動ファイル化**: コードを自動検出
- **100種類以上の拡張子対応**
- 言語別アイコン表示
- ダウンロード・コピー機能
- コードブロック自動抽出

### 🔗 WebRTC P2P共有
- **スマホ間直接通信**: WebRTCで端末間通信
- **AIモデル共有**: ダウンロード済みモデルを他の端末へ転送
- **学習データ共有**: バックグラウンド学習データを共有
- **QRコード連携**:
  - QRコード生成（接続情報）
  - QRコードスキャン（カメラ使用）
  - 手動Peer ID入力にも対応
- **リアルタイム接続管理**: 接続中デバイスの一覧表示
- **通知機能**: データ受信時に通知

### 📱 PWA (Progressive Web App)
- **完全オフライン対応**: Service Workerで全機能利用可能
- **ホーム画面追加**: アプリのようにインストール
- **オフラインインジケーター**: 接続状態を常時表示
- **自動更新**: 新バージョンを自動検出
- **キャッシュ最適化**:
  - CDNリソース（1年キャッシュ）
  - AIモデル（30日キャッシュ）
  - 最大50MBまで対応
- **通知機能**: オンライン/オフライン切り替え時に通知
- **スタンドアロンモード**: フルスクリーン表示

## 🛠️ 技術スタック

### フロントエンド
- **React 19**: 最新のReactフレームワーク
- **TypeScript**: 型安全性
- **Tailwind CSS 4**: モダンなスタイリング
- **Vite 7**: 超高速ビルド

### AI/ML
- **WebLLM**: ブラウザ内LLM推論
- **WebGPU**: GPU アクセラレーション
- **Transformers.js**: ローカルembedding生成（予定）

### ストレージ
- **IndexedDB**: チャット履歴・テンプレート・スナップショット
- **OPFS**: ファイルシステム
- **LocalStorage**: UI設定

### API/外部連携
- **GitHub API**: トレンド情報
- **HackerNews API**: 技術ニュース
- **Wikipedia API**: トレンド記事
- **NewsAPI**: 一般ニュース（オプション）

### ブラウザAPI
- **Battery API**: 省エネ管理
- **File System Access API**: ファイル読み込み
- **Clipboard API**: コピー機能
- **Web Notification API**: 通知
- **WebRTC API**: P2P通信
- **MediaDevices API**: カメラアクセス（QRスキャン）

### P2P通信
- **PeerJS**: WebRTC簡単化ライブラリ
- **QRCode**: QRコード生成
- **jsQR**: QRコード読み取り

### PWA
- **vite-plugin-pwa**: Vite PWAプラグイン
- **Workbox**: Service Workerツールキット
- **Web App Manifest**: アプリメタデータ

## 📱 対応環境

### 必須要件
- **WebGPU対応ブラウザ**:
  - Chrome 113+ (推奨)
  - Edge 113+
  - Safari 18+ (macOS)
- **メモリ**: 4GB以上推奨
- **ストレージ**: 5GB以上の空き容量

### 推奨環境
- **デスクトップ**:
  - Chrome 最新版
  - 16GB RAM
  - 専用GPU
- **モバイル**:
  - Android: Chrome 113+
  - iOS: Safari 18+ (WebGPU対応後)

## 🌐 ライブデモ

**Cloudflare Pages でホスト中:**
```
https://local-ai-webllm.pages.dev
```

今すぐ試す：完全無料、ダウンロード不要、アカウント登録不要！

## 🚀 使い方

### 1. モデル選択
1. 右上の「🤖 モデル選択」をクリック
2. 検索バーでモデルを検索、またはカテゴリでフィルタ
3. モデルを選択（初回はダウンロードが必要）

### 2. ファイル添付
1. 入力欄上の「📎 ファイル添付」をクリック
2. 任意のファイルを選択（複数可）
3. RAGファイルマネージャーでON/OFF切り替え

### 3. プロンプトテンプレート
1. ヘッダーの「📋 テンプレート」をクリック
2. カテゴリでフィルタまたは検索
3. テンプレートを選択
4. 変数に値を入力して送信

### 4. コードエディタ
1. 「📝 コードエディタ」をクリック
2. コードを入力・編集
3. 「🔍 AI解析」または「🤖 AI書き直し」を選択

### 5. 会話分岐
1. 任意のメッセージの「🌿 ここから分岐」をクリック
2. 新しい会話ブランチが開始
3. 元の履歴は保持されます

### 6. バックグラウンド学習
1. ヘッダーの「🎓」アイコンをクリック
2. 「開始」ボタンで自動学習スタート
3. 30分ごとに最新情報を収集

### 7. 省エネ設定
1. ヘッダーの「⚡/⚖️/🔋」アイコンをクリック
2. パフォーマンス/バランス/省エネから選択
3. バッテリー駆動時は自動で省エネモードに

### 8. 背景カスタマイズ
1. ヘッダーの「🎨 背景設定」をクリック
2. 画像をアップロードまたはプリセットを選択
3. GIFアニメーションにも対応！

### 9. P2P デバイス間共有
1. ヘッダーの「🔗 P2P共有」をクリック
2. 「P2P接続を開始」でPeer ID取得
3. **QRコード共有**:
   - QRコードを表示してスキャンしてもらう
   - または自分がQRコードをスキャン
4. **手動接続**: Peer IDを直接入力して接続
5. 接続後、「🤖 モデル共有」で AIモデルを転送

#### P2P共有の仕組み
```
デバイスA（モデル所有）          デバイスB（未所有）
    ↓                               ↓
  QRコード生成                   QRスキャン
    ↓                               ↓
    ←──────── WebRTC接続 ──────────→
    ↓                               ↓
  モデル送信 ─────────────────→  受信＆利用
（チャンク分割）              （ダウンロード不要）
```

## 📖 高度な機能

### スナップショット
```javascript
// スナップショット作成
const snapshotId = await snapshotManager.createSnapshot(
  "重要な会話",
  "プロジェクト設計について",
  {
    messages,
    currentModel,
    systemPrompt,
    attachedFiles,
    knowledgeIds,
  }
);

// 復元
const snapshot = snapshotManager.getSnapshot(snapshotId);
```

### カスタムプロンプトテンプレート
```javascript
// 新規テンプレート追加
promptTemplateManager.addTemplate({
  name: "API設計",
  template: "{{endpoint}}のREST APIを設計してください。\n仕様: {{spec}}",
  description: "REST API設計支援",
  variables: ["endpoint", "spec"],
  category: "設計",
  favorite: false,
});
```

### AIモデル選択ルール
```javascript
// カスタムルール追加
modelSelectorAI.addCustomRule(
  "データベース.*最適化",
  "Qwen2.5-7B-Instruct-q4f16_1-MLC"
);
```

## 🔒 プライバシー

- **完全ローカル実行**: すべての処理がブラウザ内で完結
- **データ送信なし**: チャット内容は外部に送信されません
- **オフライン動作**: インターネット不要（モデルダウンロード後）
- **PWA対応**: Service Worker でキャッシュ

## 🎯 パフォーマンス

### ビルドサイズ
- **HTML**: 6.33 MB
- **gzip圧縮後**: 2.23 MB

### 推論速度（環境依存）
- **パフォーマンスモード**: 50-100 tok/s
- **バランスモード**: 30-50 tok/s
- **省エネモード**: 10-20 tok/s

### メモリ使用量
- **ベース**: 約 200MB
- **小型モデル**: +500MB - 1GB
- **中型モデル**: +2GB - 4GB
- **大型モデル**: +5GB - 8GB

## ☁️ Cloudflare Pages デプロイ

### クイックスタート

1. **GitHubにプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Cloudflare Dashboard**
   - [Cloudflare Pages](https://pages.cloudflare.com/) にアクセス
   - 「Create a project」→ GitHubリポジトリを選択
   - ビルド設定:
     ```
     Build command: npm run build
     Build output: dist
     ```

3. **デプロイ完了**
   - 数分で `https://YOUR_PROJECT.pages.dev` にデプロイ完了
   - グローバルCDNで自動配信
   - 無料SSL自動適用

### Wrangler CLIでデプロイ

```bash
# インストール
npm install -g wrangler

# ログイン
wrangler login

# デプロイ
npm run build
wrangler pages deploy dist --project-name=local-ai-webllm
```

詳細は [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) を参照。

## 🐛 トラブルシューティング

### WebGPU が利用できない
- Chrome://flags で WebGPU を有効化
- 最新版のブラウザに更新
- GPUドライバーを更新

### モデルのダウンロードが遅い
- 安定したネットワーク環境を確保
- 小型モデルから試す
- ブラウザのキャッシュをクリア

### メモリ不足エラー
- 小型モデルを選択
- 他のタブを閉じる
- ブラウザを再起動

### ファイルが読み込めない
- ファイルサイズを確認（5MB以下推奨）
- 対応形式を確認
- バイナリファイルは自動でBase64化されます

### Cloudflare Pages デプロイエラー
- ビルドコマンド確認: `npm run build`
- Node.js バージョン: 18以上
- `_headers` と `_redirects` が `public/` にあるか確認

## 📄 ライセンス

MIT License

## 🙏 謝辞

- **WebLLM**: [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm)
- **Transformers.js**: [@xenova/transformers](https://github.com/xenova/transformers.js)
- **React**: [React Team](https://react.dev/)
- **Tailwind CSS**: [Tailwind Labs](https://tailwindcss.com/)

## 🚧 今後の予定

- [ ] Transformers.js統合（ローカルembedding）
- [ ] WASI統合（WebAssembly System Interface）
- [ ] 音声入力対応（Web Speech API）
- [ ] マルチモーダル対応（画像入力）
- [ ] PWA完全対応（オフラインインストール）
- [ ] コラボレーション機能（複数デバイス同期）
- [ ] プラグインシステム

---

**完全ローカルで動作する次世代AIチャットシステム。プライバシーを守りながら、最先端のAI技術を体験できます。🚀**
