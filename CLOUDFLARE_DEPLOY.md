# Cloudflare Pages デプロイガイド

## 🚀 概要

このアプリはCloudflare Pagesに完全対応しており、以下の機能が利用可能：

- **グローバルCDN**: 世界中で高速配信
- **無料SSL**: 自動HTTPS化
- **無制限帯域**: トラフィック制限なし
- **自動デプロイ**: Git連携で自動更新
- **WebGPU対応**: 最新Web技術サポート
- **PWA対応**: Service Worker完全動作

## 📋 前提条件

- GitHubアカウント
- Cloudflareアカウント（無料）
- Node.js 18以上

## 🔧 デプロイ手順

### 方法1: Cloudflare Dashboard（推奨）

#### ステップ1: リポジトリの準備

1. このプロジェクトをGitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/local-ai-webllm.git
git push -u origin main
```

#### ステップ2: Cloudflare Pagesでプロジェクト作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 「Pages」→「Create a project」をクリック
3. 「Connect to Git」を選択
4. GitHubリポジトリを選択
5. ビルド設定を入力：

```yaml
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 18
```

#### ステップ3: 環境変数の設定（オプション）

環境変数タブで以下を設定可能：

```bash
NODE_VERSION=18
VITE_APP_NAME="次世代型ローカルAI"
```

#### ステップ4: デプロイ

「Save and Deploy」をクリックすると自動でデプロイ開始。

数分後、以下のURLでアクセス可能：
```
https://YOUR_PROJECT.pages.dev
```

### 方法2: Wrangler CLI

#### インストール

```bash
npm install -g wrangler
```

#### ログイン

```bash
wrangler login
```

#### デプロイ

```bash
# ビルド
npm run build

# デプロイ
wrangler pages deploy dist --project-name=local-ai-webllm
```

成功すると：
```
✨ Success! Deployed to https://local-ai-webllm.pages.dev
```

### 方法3: Direct Upload

#### ビルド

```bash
npm run build
```

#### アップロード

1. Cloudflare Dashboard → Pages
2. 「Upload assets」を選択
3. `dist`フォルダをドラッグ&ドロップ

## ⚙️ 設定ファイル

### wrangler.toml

```toml
name = "local-ai-webllm"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
cwd = "./"

[[pages_build_output_dir]]
value = "dist"
```

### _headers

HTTPヘッダー設定（セキュリティ・CORS・キャッシュ）:

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  
/*.wasm
  Content-Type: application/wasm
  
/sw.js
  Cache-Control: no-cache
```

### _redirects

SPAルーティング対応:

```
/* /index.html 200
```

## 🌐 カスタムドメイン設定

### ステップ1: ドメインを追加

1. Cloudflare Pagesプロジェクト → 「Custom domains」
2. 「Set up a custom domain」
3. ドメイン名を入力（例: `ai.example.com`）

### ステップ2: DNS設定

Cloudflareが自動でDNSレコードを追加：

```
Type: CNAME
Name: ai
Content: YOUR_PROJECT.pages.dev
Proxy: Enabled (オレンジクラウド)
```

### ステップ3: SSL設定

自動的にSSL証明書が発行されます（数分）。

アクセス可能：
```
https://ai.example.com
```

## 🔒 セキュリティ設定

### 推奨ヘッダー（_headersに設定済み）

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### アクセス制限（オプション）

Cloudflare Access で認証を追加可能：

1. Pages設定 → 「Access policies」
2. ルールを作成（例: Emailドメイン制限）

## 📊 パフォーマンス最適化

### 1. キャッシュ設定

`_headers`ファイルで設定：

```
# 静的アセット: 1年キャッシュ
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# HTML: キャッシュなし
/*.html
  Cache-Control: no-cache
```

### 2. Argo Smart Routing（有料）

Cloudflare Dashboard → Argo で有効化すると、さらに高速化。

### 3. 画像最適化

Cloudflare Images（オプション）:
- 自動WebP変換
- レスポンシブ画像
- 遅延ロード

## 🔄 自動デプロイ設定

### Git連携（デフォルト）

```
main ブランチ → 本番環境
develop ブランチ → プレビュー環境（自動生成）
PR作成 → プレビューURL自動生成
```

### デプロイフック

Webhook URLを取得して手動デプロイ：

```bash
curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/deploy/YOUR_HOOK_ID"
```

### GitHub Actions（オプション）

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: local-ai-webllm
          directory: dist
```

## 📈 分析・監視

### Cloudflare Web Analytics

無料で利用可能：

1. Pages設定 → 「Web Analytics」
2. 「Enable Web Analytics」

提供データ：
- ページビュー
- ユニークビジター
- ブラウザ・OS統計
- 国別アクセス

### ログ確認

リアルタイムログ:

```bash
wrangler pages deployment tail
```

## 🌍 グローバル配信

Cloudflareの全CDNエッジロケーション（275+）から配信：

- アジア: 東京、大阪、ソウル、シンガポール等
- ヨーロッパ: ロンドン、フランクフルト、パリ等
- 北米: ロサンゼルス、ニューヨーク、シカゴ等

レイテンシ: 通常 < 50ms

## 🛠️ トラブルシューティング

### ビルドエラー

**症状**: ビルドが失敗する

**解決策**:
```bash
# ローカルでビルド確認
npm run build

# node_modules削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### Service Workerが動作しない

**症状**: PWAが機能しない

**解決策**:
1. `_headers`で`Service-Worker-Allowed: /`を確認
2. HTTPSでアクセスしているか確認
3. ブラウザのDevToolsでSW登録を確認

### WebGPUが動作しない

**症状**: AIモデルがロードできない

**解決策**:
1. `_headers`のCORSヘッダーを確認
2. `Cross-Origin-Embedder-Policy: require-corp`
3. `Cross-Origin-Opener-Policy: same-origin`
4. ブラウザがWebGPU対応か確認

### 404エラー（SPA）

**症状**: リロード時に404

**解決策**:
`_redirects`ファイルを確認:
```
/* /index.html 200
```

### 大きなファイルのアップロード

**症状**: ビルドサイズが大きすぎる

**制限**: Cloudflare Pages は最大25MBまで

**解決策**:
1. AIモデルは外部CDN（jsdelivr等）から読み込み
2. 画像を最適化
3. コード分割（lazy loading）

## 💰 料金

### Cloudflare Pages 無料プラン

- **ビルド数**: 500/月
- **帯域**: 無制限
- **リクエスト**: 無制限
- **プロジェクト数**: 100
- **カスタムドメイン**: 無制限
- **SSL証明書**: 無料

### Pro プラン ($20/月)

- ビルド数: 5,000/月
- 同時ビルド: 5
- ビルドタイムアウト: 30分

通常は**無料プランで十分**です。

## 🔗 便利なリンク

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Wrangler CLI リファレンス](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [コミュニティフォーラム](https://community.cloudflare.com/)

## 📝 チェックリスト

デプロイ前に確認：

- [ ] `npm run build` がエラーなく完了
- [ ] `dist`フォルダが生成されている
- [ ] `_headers` ファイルが`public`フォルダにある
- [ ] `_redirects` ファイルが`public`フォルダにある
- [ ] GitHubリポジトリがpublic/privateどちらでもOK
- [ ] Node.js 18以上を使用

デプロイ後に確認：

- [ ] HTTPSでアクセス可能
- [ ] PWAインストールプロンプトが表示される
- [ ] Service Workerが登録されている
- [ ] オフラインでも動作する
- [ ] WebGPUが利用可能（対応ブラウザ）
- [ ] P2P接続が確立できる
- [ ] すべてのページが正常に表示される

---

**🎊 Cloudflare Pagesで、世界中に高速配信！無料で無制限のグローバルCDN！** 🌍✨

**デプロイ時間**: 約3-5分
**グローバル展開**: 即座に275+ロケーション
**コスト**: 完全無料（無料プラン）
