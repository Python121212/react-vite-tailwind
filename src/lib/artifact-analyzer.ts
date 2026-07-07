import { Artifact } from "../types";

export class ArtifactAnalyzer {
  /**
   * AI生成テキストからコードブロックを検出し、Artifactとして抽出
   */
  static extractArtifacts(text: string): Artifact[] {
    const artifacts: Artifact[] = [];
    
    // コードブロックの正規表現: ```言語名\nコード\n```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let index = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1] || "text";
      const content = match[2].trim();
      
      if (content.length > 0) {
        const artifact: Artifact = {
          id: `artifact-${Date.now()}-${index}`,
          type: this.detectArtifactType(content, language),
          language: language,
          filename: this.generateFilename(language, index),
          content: content,
          timestamp: Date.now(),
        };
        
        artifacts.push(artifact);
        index++;
      }
    }

    return artifacts;
  }

  /**
   * コンテンツの種類を判定
   */
  private static detectArtifactType(
    content: string,
    language: string
  ): "code" | "text" | "data" {
    const dataFormats = ["json", "xml", "yaml", "yml", "csv", "sql"];
    const codeFormats = [
      "javascript",
      "typescript",
      "python",
      "java",
      "cpp",
      "c",
      "rust",
      "go",
      "php",
      "ruby",
      "swift",
      "kotlin",
      "html",
      "css",
      "jsx",
      "tsx",
    ];

    if (dataFormats.includes(language.toLowerCase())) {
      return "data";
    }

    if (codeFormats.includes(language.toLowerCase())) {
      return "code";
    }

    // コード的な特徴があるか検査
    const codePatterns = [
      /function\s+\w+/,
      /class\s+\w+/,
      /import\s+/,
      /const\s+\w+\s*=/,
      /def\s+\w+/,
      /public\s+class/,
    ];

    if (codePatterns.some((pattern) => pattern.test(content))) {
      return "code";
    }

    return "text";
  }

  /**
   * ファイル名を自動生成
   */
  private static generateFilename(language: string, index: number): string {
    const extensions: Record<string, string> = {
      // プログラミング言語
      javascript: "js", js: "js",
      typescript: "ts", ts: "ts",
      python: "py", py: "py",
      java: "java",
      cpp: "cpp", "c++": "cpp",
      c: "c",
      rust: "rs", rs: "rs",
      go: "go",
      php: "php",
      ruby: "rb", rb: "rb",
      swift: "swift",
      kotlin: "kt", kt: "kt",
      scala: "scala",
      dart: "dart",
      lua: "lua",
      perl: "pl", pl: "pl",
      r: "r",
      matlab: "m",
      julia: "jl",
      elixir: "ex", ex: "ex",
      erlang: "erl",
      haskell: "hs",
      clojure: "clj",
      fsharp: "fs",
      ocaml: "ml",
      
      // Web
      html: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",
      jsx: "jsx",
      tsx: "tsx",
      vue: "vue",
      svelte: "svelte",
      
      // データ
      json: "json",
      xml: "xml",
      yaml: "yaml", yml: "yml",
      toml: "toml",
      csv: "csv",
      sql: "sql",
      
      // シェル
      shell: "sh", sh: "sh",
      bash: "bash",
      zsh: "zsh",
      powershell: "ps1",
      batch: "bat", bat: "bat",
      cmd: "cmd",
      
      // ドキュメント
      markdown: "md", md: "md",
      text: "txt", txt: "txt",
      latex: "tex", tex: "tex",
      rst: "rst",
      
      // 設定ファイル
      dockerfile: "Dockerfile",
      makefile: "Makefile",
      cmake: "cmake",
      gradle: "gradle",
      
      // その他
      graphql: "graphql", gql: "gql",
      proto: "proto",
      thrift: "thrift",
      wasm: "wasm", wat: "wat",
      
      // 実行ファイル
      exe: "exe",
      dll: "dll",
      so: "so",
      dylib: "dylib",
      
      // アーカイブ
      zip: "zip",
      tar: "tar",
      gz: "gz",
      "7z": "7z",
      rar: "rar",
    };

    const ext = extensions[language.toLowerCase()] || language.toLowerCase() || "txt";
    return `artifact_${index + 1}.${ext}`;
  }

  /**
   * 言語に応じたアイコンを返す
   */
  static getLanguageIcon(language: string): string {
    const icons: Record<string, string> = {
      // プログラミング言語
      javascript: "📜", js: "📜",
      typescript: "📘", ts: "📘",
      python: "🐍", py: "🐍",
      java: "☕",
      cpp: "⚙️", "c++": "⚙️",
      c: "⚙️",
      rust: "🦀", rs: "🦀",
      go: "🐹",
      php: "🐘",
      ruby: "💎", rb: "💎",
      swift: "🦅",
      kotlin: "🎯", kt: "🎯",
      scala: "🔴",
      dart: "🎯",
      lua: "🌙",
      perl: "🐪",
      r: "📊",
      julia: "🟣",
      elixir: "💧",
      haskell: "λ",
      
      // Web
      html: "🌐",
      css: "🎨",
      scss: "💅",
      sass: "💅",
      jsx: "⚛️",
      tsx: "⚛️",
      vue: "💚",
      svelte: "🧡",
      
      // データ
      json: "📋",
      xml: "📄",
      yaml: "📝", yml: "📝",
      toml: "⚙️",
      csv: "📊",
      sql: "🗄️",
      
      // シェル
      shell: "🐚", sh: "🐚",
      bash: "🐚",
      powershell: "💻",
      batch: "⚙️",
      
      // ドキュメント
      markdown: "📝", md: "📝",
      text: "📄", txt: "📄",
      latex: "📚",
      pdf: "📕",
      
      // 実行ファイル
      exe: "⚙️",
      dll: "📦",
      so: "📦",
      
      // アーカイブ
      zip: "🗜️",
      tar: "📦",
      gz: "🗜️",
      "7z": "🗜️",
      rar: "🗜️",
      
      // その他
      dockerfile: "🐳",
      docker: "🐳",
      makefile: "🔨",
      graphql: "🔷",
      wasm: "🌐",
    };

    return icons[language.toLowerCase()] || "📄";
  }
}
