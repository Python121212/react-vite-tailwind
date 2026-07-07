# 🚀 クイックデプロイガイド - Cloudflare Pages

## 最速デプロイ（5分）

### ステップ1: GitHubにプッシュ

```bash
# 初回のみ
git init
git add .
git commit -m "🚀 Initial deployment"

# リモートリポジトリ作成後
git remote add origin https://github.com/YOUR_USERNAME/local-ai-webllm.git
git push -u origin main
```

### ステップ2: Cloudflare Pages設定

1. [Cloudflare Pages](https://dash.cloudflare.com/sign-up/pages) にアクセス（無料アカウント作成）

2. **「Create a project」**をクリック

3. **「Connect to Git」**を選択

4. GitHubを認証してリポジトリを選択

5. **ビルド設定**を入力：

```yaml
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 18
```

6. **「Save and Deploy」**をクリック

7. ✅ 完了！数分で `https://YOUR_PROJECT.pages.dev` にデプロイされます

---

## デプロイ確認チェックリスト

デプロイ後、以下を確認：

- [ ] HTTPSでアクセス可能
- [ ] PWAインストールプロンプトが表示される
- [ ] オフラインでも動作する
- [ ] WebGPU が利用可能（Chrome/Edge）
- [ ] AIモデルをダウンロード・実行できる
- [ ] ファイル添付機能が動作する
- [ ] P2P接続が確立できる
- [ ] QRコードスキャンが動作する

---

## 🌐 カスタムドメイン設定（オプション）

1. Cloudflare Pages プロジェクト → **「Custom domains」**

2. **「Set up a custom domain」**

3. ドメイン入力（例: `ai.yourdomain.com`）

4. Cloudflareが自動でDNS設定 → SSL証明書自動発行

5. ✅ 完了！`https://ai.yourdomain.com` でアクセス可能

---

## 🔄 自動デプロイ

### Git連携（自動）

```bash
# コード変更をプッシュするだけで自動デプロイ
git add .
git commit -m "✨ Add new feature"
git push
```

Cloudflareが自動検知して即座にデプロイ開始！

### プレビュー環境

- **main ブランチ**: 本番環境
- **develop ブランチ**: 自動プレビュー環境生成
- **Pull Request**: PR専用プレビューURL自動生成

---

## 📊 デプロイ後の動作確認

### 1. HTTPS確認

```
https://YOUR_PROJECT.pages.dev
```

### 2. Service Worker確認

DevTools → Application → Service Workers

```
✅ sw.js: Activated and is running
```

### 3. PWA確認

DevTools → Application → Manifest

```
✅ Name: 次世代型ローカルAI - WebLLM
✅ Start URL: /
✅ Display: standalone
```

### 4. WebGPU確認

Console で実行:

```javascript
if ('gpu' in navigator) {
  console.log('✅ WebGPU対応');
} else {
  console.log('❌ WebGPU非対応');
}
```

### 5. オフライン確認

1. DevTools → Network → 「Offline」にチェック
2. ページをリロード
3. ✅ オフラインでも正常に動作すること

---

## 🛠️ トラブルシューティング

### ビルドエラー

**エラー**: `Build failed`

**解決策**:
```bash
# ローカルでビルド確認
npm install
npm run build

# エラーがなければGitにプッシュ
git add .
git commit -m "Fix build"
git push
```

### Service Workerが登録されない

**解決策**:
1. `public/_headers` ファイルが存在するか確認
2. HTTPSでアクセスしているか確認
3. ブラウザのキャッシュをクリア

### WebGPUエラー

**解決策**:
1. Chrome 113+ / Edge 113+ を使用
2. `chrome://flags` で WebGPU を有効化
3. `_headers` のCORS設定を確認

---

## 💰 料金

### 無料プラン（推奨）

- ✅ **無制限帯域**
- ✅ **無制限リクエスト**
- ✅ **500ビルド/月**
- ✅ **100プロジェクト**
- ✅ **カスタムドメイン無制限**
- ✅ **自動SSL**

**このアプリは無料プランで完全動作します！**

---

## 📈 パフォーマンス

### グローバルCDN

Cloudflareの275+エッジロケーションから配信：

- 🌏 アジア: < 50ms
- 🌍 ヨーロッパ: < 50ms  
- 🌎 北米: < 50ms

### キャッシュ最適化

- 静的アセット: 1年キャッシュ
- HTML: キャッシュなし（常に最新）
- Service Worker: 即座に更新

---

## 🔗 便利なリンク

- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [デプロイログ確認](https://dash.cloudflare.com/pages)
- [詳細ガイド](./CLOUDFLARE_DEPLOY.md)
- [PWAガイド](./PWA_GUIDE.md)
- [P2Pガイド](./P2P_GUIDE.md)

---

## ⚡ 次のステップ

デプロイが完了したら：

1. **PWAインストール**: ホーム画面に追加
2. **AIモデルダウンロード**: 好きなモデルを選択
3. **オフラインテスト**: ネットワークをOFFにして動作確認
4. **P2P共有**: 友人とQRコードで接続
5. **カスタムドメイン**: 独自ドメインを設定

---

**🎊 デプロイ完了！世界中から高速アクセス可能なAIアプリの完成です！** 🌍✨

```
本番URL: https://YOUR_PROJECT.pages.dev
デプロイ時間: 約3-5分
グローバル配信: 即座に275+ロケーション
料金: 完全無料
```
