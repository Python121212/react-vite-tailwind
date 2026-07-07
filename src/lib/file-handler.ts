/**
 * ファイル読み込み・解析ハンドラー
 * すべての拡張子に対応
 */

export interface ParsedFile {
  name: string;
  size: number;
  type: string;
  extension: string;
  content: string;
  encoding: string;
  metadata?: Record<string, any>;
}

export class UniversalFileHandler {
  /**
   * ファイルを読み込んで解析
   */
  static async readFile(file: File): Promise<ParsedFile> {
    const extension = this.getExtension(file.name);
    const parsedFile: ParsedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      extension,
      content: "",
      encoding: "utf-8",
      metadata: {},
    };

    try {
      // バイナリファイルの判定
      if (this.isBinaryFile(extension)) {
        parsedFile.content = await this.readAsBinaryString(file);
        parsedFile.encoding = "binary";
        parsedFile.metadata = await this.extractBinaryMetadata(file, extension);
      } else {
        // テキストファイルとして読み込み
        parsedFile.content = await this.readAsText(file);
        parsedFile.metadata = this.extractTextMetadata(parsedFile.content, extension);
      }
    } catch (error) {
      console.error("ファイル読み込みエラー:", error);
      throw new Error(`ファイルの読み込みに失敗しました: ${file.name}`);
    }

    return parsedFile;
  }

  /**
   * テキストとして読み込み
   */
  private static async readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * バイナリ文字列として読み込み
   */
  private static async readAsBinaryString(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        // Base64エンコード
        const base64 = btoa(String.fromCharCode(...bytes));
        resolve(`[Binary File - Base64 Encoded]\nSize: ${file.size} bytes\nType: ${file.type}\nBase64: ${base64.slice(0, 200)}...`);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 拡張子を取得
   */
  private static getExtension(filename: string): string {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  }

  /**
   * バイナリファイルかどうか判定
   */
  private static isBinaryFile(extension: string): boolean {
    const binaryExtensions = [
      // 実行ファイル
      "exe", "dll", "so", "dylib", "app", "bin",
      // アーカイブ
      "zip", "rar", "7z", "tar", "gz", "bz2", "xz",
      // 画像
      "jpg", "jpeg", "png", "gif", "bmp", "webp", "ico", "svg",
      // 音声
      "mp3", "wav", "ogg", "flac", "aac", "m4a",
      // 動画
      "mp4", "avi", "mkv", "mov", "wmv", "flv", "webm",
      // ドキュメント
      "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
      // データベース
      "db", "sqlite", "sqlite3", "mdb",
      // フォント
      "ttf", "otf", "woff", "woff2",
      // その他
      "pyc", "class", "o", "obj",
    ];

    return binaryExtensions.includes(extension);
  }

  /**
   * テキストメタデータ抽出
   */
  private static extractTextMetadata(content: string, extension: string): Record<string, any> {
    const metadata: Record<string, any> = {
      lines: content.split("\n").length,
      characters: content.length,
      words: content.split(/\s+/).filter(Boolean).length,
    };

    // プログラミング言語の検出
    if (this.isProgrammingFile(extension)) {
      metadata.language = this.detectLanguage(extension);
      metadata.codeAnalysis = this.analyzeCode(content, extension);
    }

    return metadata;
  }

  /**
   * バイナリメタデータ抽出
   */
  private static async extractBinaryMetadata(
    file: File,
    extension: string
  ): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {
      fileType: this.getFileType(extension),
      readable: false,
    };

    // 画像ファイルの場合
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) {
      try {
        const dimensions = await this.getImageDimensions(file);
        metadata.width = dimensions.width;
        metadata.height = dimensions.height;
        metadata.readable = true;
      } catch (e) {
        // 無視
      }
    }

    return metadata;
  }

  /**
   * 画像サイズ取得
   */
  private static async getImageDimensions(
    file: File
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * プログラミングファイルか判定
   */
  private static isProgrammingFile(extension: string): boolean {
    const programmingExtensions = [
      "js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "cc", "cxx",
      "h", "hpp", "cs", "go", "rs", "swift", "kt", "rb", "php", "html",
      "css", "scss", "sass", "less", "json", "xml", "yaml", "yml", "sql",
      "sh", "bash", "zsh", "ps1", "bat", "cmd", "r", "m", "scala",
      "clj", "erl", "ex", "exs", "dart", "lua", "vim", "pl", "pm",
    ];

    return programmingExtensions.includes(extension);
  }

  /**
   * 言語検出
   */
  private static detectLanguage(extension: string): string {
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      jsx: "React JSX",
      ts: "TypeScript",
      tsx: "React TSX",
      py: "Python",
      java: "Java",
      c: "C",
      cpp: "C++",
      cc: "C++",
      cxx: "C++",
      h: "C/C++ Header",
      hpp: "C++ Header",
      cs: "C#",
      go: "Go",
      rs: "Rust",
      swift: "Swift",
      kt: "Kotlin",
      rb: "Ruby",
      php: "PHP",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      sass: "Sass",
      json: "JSON",
      xml: "XML",
      yaml: "YAML",
      yml: "YAML",
      sql: "SQL",
      sh: "Shell",
      bash: "Bash",
      r: "R",
      scala: "Scala",
      dart: "Dart",
      lua: "Lua",
    };

    return languageMap[extension] || "Unknown";
  }

  /**
   * コード解析
   */
  private static analyzeCode(content: string, _extension: string): Record<string, any> {
    const analysis: Record<string, any> = {};

    // 関数カウント
    const functionPatterns = [
      /function\s+\w+/g,
      /def\s+\w+/g,
      /\w+\s*\([^)]*\)\s*{/g,
    ];

    let functionCount = 0;
    functionPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) functionCount += matches.length;
    });

    analysis.estimatedFunctions = functionCount;

    // クラスカウント
    const classMatches = content.match(/class\s+\w+/g);
    analysis.estimatedClasses = classMatches ? classMatches.length : 0;

    // インポートカウント
    const importMatches = content.match(/import\s+/g);
    analysis.estimatedImports = importMatches ? importMatches.length : 0;

    return analysis;
  }

  /**
   * ファイルタイプ判定
   */
  private static getFileType(extension: string): string {
    const typeMap: Record<string, string> = {
      exe: "実行ファイル",
      dll: "ライブラリ",
      zip: "アーカイブ",
      jpg: "画像",
      jpeg: "画像",
      png: "画像",
      mp3: "音声",
      mp4: "動画",
      pdf: "ドキュメント",
      db: "データベース",
      ttf: "フォント",
    };

    return typeMap[extension] || "不明";
  }

  /**
   * ファイルを文字列として要約
   */
  static summarizeFile(parsedFile: ParsedFile): string {
    let summary = `📁 ファイル名: ${parsedFile.name}\n`;
    summary += `📊 サイズ: ${this.formatFileSize(parsedFile.size)}\n`;
    summary += `🏷️ 拡張子: .${parsedFile.extension}\n`;

    if (parsedFile.metadata) {
      if (parsedFile.metadata.lines) {
        summary += `📝 行数: ${parsedFile.metadata.lines}行\n`;
      }
      if (parsedFile.metadata.language) {
        summary += `💻 言語: ${parsedFile.metadata.language}\n`;
      }
      if (parsedFile.metadata.width && parsedFile.metadata.height) {
        summary += `🖼️ サイズ: ${parsedFile.metadata.width}x${parsedFile.metadata.height}px\n`;
      }
    }

    summary += `\n--- ファイル内容 ---\n${parsedFile.content.slice(0, 5000)}`;

    if (parsedFile.content.length > 5000) {
      summary += `\n\n... (残り${parsedFile.content.length - 5000}文字)`;
    }

    return summary;
  }

  /**
   * ファイルサイズをフォーマット
   */
  private static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}
