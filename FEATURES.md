# 機能一覧

## 📋 目次

1. [AIモデル管理](#aiモデル管理)
2. [Chain-of-Thought可視化](#chain-of-thought可視化)
3. [ファイル管理](#ファイル管理)
4. [RAGシステム](#ragシステム)
5. [会話管理](#会話管理)
6. [プロンプト管理](#プロンプト管理)
7. [コードエディタ](#コードエディタ)
8. [バックグラウンド学習](#バックグラウンド学習)
9. [省エネ管理](#省エネ管理)
10. [UI/UXカスタマイズ](#uiuxカスタマイズ)

---

## AIモデル管理

### 120種類以上のモデル対応

#### Llama シリーズ (Meta)
- Llama 3.2 (1B, 3B) - 最新の汎用モデル
- Llama 3.1 (8B) - 高性能版

#### Qwen シリーズ (Alibaba)
- **汎用**: Qwen 2.5 (0.5B, 1.5B, 3B, 7B)
- **コーディング**: Qwen 2.5 Coder (1.5B, 7B)
- **数学**: Qwen 2.5 Math (1.5B, 7B)

#### Phi シリーズ (Microsoft)
- Phi 3.5 Mini
- Phi 3 Mini (4K, 128K)
- Phi 3 Medium

#### Gemma シリーズ (Google)
- Gemma 2 (2B, 9B)
- Gemma 1 (2B, 7B)

#### 専門モデル
- **DeepSeek Coder**: 高精度コード生成
- **CodeLlama**: Meta製コーディング
- **Mistral 7B**: フランス製高性能
- **SmolLM2**: 超軽量（135M, 360M, 1.7B）

### 自動モデル選択

```typescript
// タスクに応じて自動選択
const analysis = modelSelectorAI.analyzeTask(userInput);

// 例:
"こんにちは" → SmolLM2-360M (超高速)
"Pythonでソート" → Qwen2.5-Coder-7B (専門)
"なぜ空は青い？" → Llama-3.1-8B (推論)
```

### カスタムルール

```typescript
// 正規表現でルール追加
modelSelectorAI.addCustomRule(
  "データベース.*設計",
  "Qwen2.5-7B-Instruct-q4f16_1-MLC"
);
```

---

## Chain-of-Thought可視化

### 思考プロセスの可視化

AIの思考過程をステップバイステップで表示：

```
🧠 思考プロセス (Chain-of-Thought)

1️⃣ 問題の理解
   ユーザーはソートアルゴリズムの実装を求めている

2️⃣ アプローチの選択
   クイックソートが効率的。O(n log n)の時間計算量

3️⃣ 実装の設計
   再帰的なアプローチを採用。ピボット選択が重要

4️⃣ コード生成
   Python で実装。テストケースも含める
```

### 機能
- ✅ 折りたたみ可能
- ✅ タイムスタンプ表示
- ✅ アニメーション
- ✅ ステップ番号付き

---

## ファイル管理

### OPFS (Origin Private File System)

ブラウザ専用の高速ファイルシステム：

```typescript
// 初期化
await opfsStorage.initialize();

// ファイル保存
await opfsStorage.saveFile("projects/app.js", codeContent);

// ファイル読み込み
const content = await opfsStorage.readFile("projects/app.js");

// 全ファイル一覧
const files = await opfsStorage.listAllFiles();

// 検索
const results = await opfsStorage.searchFiles("React");
```

### 対応拡張子（100種類以上）

#### プログラミング言語
```
js, jsx, ts, tsx, py, java, c, cpp, rs, go, php, ruby,
swift, kotlin, scala, dart, lua, perl, r, matlab, julia,
elixir, erlang, haskell, clojure, fsharp, ocaml
```

#### Web開発
```
html, css, scss, sass, less, vue, svelte
```

#### データ形式
```
json, xml, yaml, yml, toml, csv, sql
```

#### シェルスクリプト
```
sh, bash, zsh, ps1, bat, cmd
```

#### ドキュメント
```
md, txt, tex, rst, pdf, doc, docx
```

#### 実行ファイル
```
exe, dll, so, dylib, app, bin
```

#### アーカイブ
```
zip, rar, 7z, tar, gz, bz2, xz
```

#### 画像・メディア
```
jpg, jpeg, png, gif, webp, svg, bmp, ico,
mp3, wav, ogg, flac, mp4, avi, mkv, mov
```

### ファイル解析

```typescript
const parsedFile = await UniversalFileHandler.readFile(file);

// 解析結果
{
  name: "app.js",
  size: 12345,
  type: "text/javascript",
  extension: "js",
  content: "...",
  encoding: "utf-8",
  metadata: {
    lines: 300,
    characters: 12345,
    words: 2000,
    language: "JavaScript",
    codeAnalysis: {
      estimatedFunctions: 15,
      estimatedClasses: 3,
      estimatedImports: 8
    }
  }
}
```

---

## RAGシステム

### 高度なファイル管理UI

```
📚 RAG参照ファイル (3/5)

[✓ app.js (15.2 KB • 参照中)]  [✕]
[  README.md (8.5 KB)]          [✕]
[✓ config.json (1.2 KB • 参照中)] [✕]
[  package.json (2.1 KB)]       [✕]
[✓ index.html (3.8 KB • 参照中)] [✕]
```

### 機能
- ✅ クリックでON/OFF
- ✅ 視覚的なアクティブ状態
- ✅ ファイルサイズ表示
- ✅ 個別削除ボタン
- ✅ 絵文字アイコン

### ベクトル検索（予定）

```typescript
// Transformers.js統合
const embedding = await generateEmbedding(query);
const results = await vectorSearch(embedding, topK=5);
```

---

## 会話管理

### 会話ツリー

```
conversation-root
├── message-1 (ユーザー: こんにちは)
├── message-2 (AI: こんにちは！)
├── message-3 (ユーザー: Pythonについて教えて)
├── message-4 (AI: Pythonは...)
│   ├── branch-1 (ユーザー: もっと詳しく) ← 分岐1
│   │   └── message-5 (AI: Pythonの歴史は...)
│   └── branch-2 (ユーザー: Javaと比較して) ← 分岐2
│       └── message-6 (AI: Javaと比較すると...)
```

### 会話分岐

```typescript
// 特定メッセージから分岐
conversationTreeManager.createBranch(sessionId, messageId);

// 現在のパス取得
const messages = conversationTreeManager.getCurrentMessages(sessionId);

// 子ノード取得
const children = conversationTreeManager.getChildren(sessionId, messageId);
```

### スナップショット

```typescript
// 完全な状態を保存
const snapshotId = await snapshotManager.createSnapshot(
  "重要な設計会議",
  "アーキテクチャ設計について",
  {
    messages: currentMessages,
    currentModel: "Llama-3.1-8B-Instruct-q4f16_1-MLC",
    systemPrompt: "あなたはシニアアーキテクトです",
    attachedFiles: [file1, file2],
    knowledgeIds: ["knowledge-1", "knowledge-2"]
  }
);

// 復元
const snapshot = snapshotManager.getSnapshot(snapshotId);

// エクスポート
const json = snapshotManager.exportSnapshot(snapshotId);
downloadFile(json, "snapshot.json");

// インポート
const importedId = await snapshotManager.importSnapshot(jsonString);
```

---

## プロンプト管理

### テンプレート変数

```typescript
// テンプレート定義
{
  name: "コードリファクタリング",
  template: "以下のコードをリファクタリングしてください：\n\n{{code}}\n\n改善点：\n- {{focus}}",
  variables: ["code", "focus"],
  category: "コーディング"
}

// 適用
const prompt = promptTemplateManager.applyTemplate(
  templateId,
  {
    code: "function add(a,b){return a+b}",
    focus: "型安全性とドキュメント"
  }
);
// 結果:
// "以下のコードをリファクタリングしてください：
//
// function add(a,b){return a+b}
//
// 改善点：
// - 型安全性とドキュメント"
```

### デフォルトテンプレート

1. **コードリファクタリング**
   - 変数: `{{code}}`
   - 用途: コード品質向上

2. **バグ修正**
   - 変数: `{{code}}`, `{{error}}`
   - 用途: デバッグ支援

3. **文章要約**
   - 変数: `{{text}}`, `{{length}}`
   - 用途: 長文を簡潔に

4. **翻訳**
   - 変数: `{{text}}`, `{{target_lang}}`
   - 用途: 多言語翻訳

5. **コード説明**
   - 変数: `{{code}}`
   - 用途: 初心者向け解説

6. **テストケース生成**
   - 変数: `{{code}}`, `{{framework}}`
   - 用途: ユニットテスト作成

7. **ドキュメント生成**
   - 変数: `{{code}}`, `{{format}}`
   - 用途: API文書作成

8. **コード変換**
   - 変数: `{{code}}`, `{{source_lang}}`, `{{target_lang}}`
   - 用途: 言語間変換

### カスタムテンプレート

```typescript
// 新規作成
promptTemplateManager.addTemplate({
  name: "API設計",
  template: "{{endpoint}}のREST APIを設計してください。\n\n仕様:\n{{spec}}\n\n認証方式: {{auth}}",
  description: "REST API設計支援",
  variables: ["endpoint", "spec", "auth"],
  category: "設計",
  favorite: true
});
```

---

## コードエディタ

### 機能

#### 基本機能
- ✅ 行番号表示
- ✅ シンタックスハイライト風UI
- ✅ 自動インデント
- ✅ フォーマット機能
- ✅ コピー・ダウンロード

#### AI連携
- 🔍 **AI解析**: コードを送信して解析
- 🤖 **AI書き直し**: リファクタリング依頼

### 使用例

```typescript
// エディタを開く
setEditorCode(initialCode);
setShowCodeEditor(true);

// AI解析
onAnalyze={(code) => {
  handleSendMessage(`以下のコードを解析してください：\n\`\`\`\n${code}\n\`\`\``);
}}

// AI書き直し
onRewrite={(code) => {
  handleSendMessage(`以下のコードをリファクタリングしてください：\n\`\`\`\n${code}\n\`\`\``);
}}
```

### フォーマット機能

```javascript
// 自動インデント整理
function formatCode(code) {
  const lines = code.split('\n');
  let indentLevel = 0;
  
  return lines.map(line => {
    const trimmed = line.trim();
    
    // インデント減少
    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    const formatted = '  '.repeat(indentLevel) + trimmed;
    
    // インデント増加
    if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
      indentLevel++;
    }
    
    return formatted;
  }).join('\n');
}
```

---

## バックグラウンド学習

### データソース

1. **GitHub Trending**
   - 最新のトレンドリポジトリ
   - スター数1000以上
   - 言語情報含む

2. **HackerNews**
   - トップストーリー
   - 技術ニュース
   - コメント数情報

3. **Wikipedia Trending**
   - 最も閲覧された記事
   - 日次ランキング
   - 多言語対応

4. **NewsAPI**
   - スポーツニュース
   - 一般ニュース
   - 多カテゴリ

### 自動収集

```typescript
// 30分ごとに自動実行
backgroundLearning.startLearning(30);

// 手動実行
await backgroundLearning.collectKnowledge();

// 関連知識検索
const knowledge = await backgroundLearning.searchKnowledge(
  "React 最新情報",
  limit=5
);
```

### 知識エントリ

```typescript
interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: "GitHub Trending" | "HackerNews" | "Wikipedia" | "NewsAPI";
  category: "技術" | "スポーツ" | "ニュース" | "トレンド";
  timestamp: number;
  embedding?: number[]; // 将来的にベクトル化
}
```

---

## 省エネ管理

### 3つのモード

#### ⚡ パフォーマンス
```typescript
{
  mode: "performance",
  maxTokensPerSecond: 100,
  enableBackgroundLearning: true,
  gpuPowerLimit: 100
}
```

#### ⚖️ バランス（推奨）
```typescript
{
  mode: "balanced",
  maxTokensPerSecond: 50,
  enableBackgroundLearning: true,
  gpuPowerLimit: 70
}
```

#### 🔋 省エネ
```typescript
{
  mode: "power-saver",
  maxTokensPerSecond: 20,
  enableBackgroundLearning: false,
  gpuPowerLimit: 40
}
```

### Battery API連携

```typescript
// バッテリー情報取得
const battery = await navigator.getBattery();

// 自動モード切替
if (!battery.charging && battery.level < 0.2) {
  powerManager.setMode("power-saver");
} else if (battery.charging) {
  powerManager.setMode("performance");
}
```

### UI更新スロットリング

```typescript
// 省エネモード時
const throttleDelay = powerManager.getThrottleDelay();

if (now - lastUpdateTime < throttleDelay) {
  return; // UI更新をスキップ
}
```

---

## UI/UXカスタマイズ

### 背景カスタマイズ

#### プリセットグラデーション

1. **ブルーグラデーション**
   ```css
   linear-gradient(135deg, #667eea 0%, #764ba2 100%)
   ```

2. **サンセット**
   ```css
   linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
   ```

3. **オーシャン**
   ```css
   linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
   ```

4. **フォレスト**
   ```css
   linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)
   ```

5. **トワイライト**
   ```css
   linear-gradient(135deg, #fa709a 0%, #fee140 100%)
   ```

6. **ミッドナイト**
   ```css
   linear-gradient(135deg, #2e3192 0%, #1bffff 100%)
   ```

7. **ピーチ**
   ```css
   linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)
   ```

8. **ラベンダー**
   ```css
   linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)
   ```

#### カスタム画像

```typescript
// 画像アップロード
const file = event.target.files[0];

// サイズチェック（5MB以下）
if (file.size > 5 * 1024 * 1024) {
  alert("画像サイズは5MB以下にしてください");
  return;
}

// 適用（GPU/CPU負荷ゼロ）
document.body.style.backgroundImage = `url(${dataUrl})`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundAttachment = "fixed";
```

### レスポンシブ対応

#### ブレークポイント
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### モバイル最適化
```css
/* タッチ操作しやすいボタン */
.mobile-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* 固定ダイアログ */
.mobile-dialog {
  position: fixed;
  top: 80px;
  left: 16px;
  right: 16px;
}
```

---

**すべての機能が完全ローカルで動作。プライバシーを守りながら最先端のAI体験を提供します。** 🚀
