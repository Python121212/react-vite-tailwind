/**
 * OPFS (Origin Private File System) ストレージ
 * スマートフォンの全ファイルを認識・記憶
 */

export interface StoredFile {
  path: string;
  name: string;
  content: string;
  size: number;
  mimeType: string;
  lastModified: number;
  embedding?: number[];
}

export class OPFSStorage {
  private root: FileSystemDirectoryHandle | null = null;

  /**
   * OPFS初期化
   */
  async initialize(): Promise<void> {
    if ("storage" in navigator && "getDirectory" in navigator.storage) {
      try {
        this.root = await navigator.storage.getDirectory();
        console.log("✅ OPFS初期化成功");
      } catch (error) {
        console.error("❌ OPFS初期化失敗:", error);
        throw error;
      }
    } else {
      console.warn("⚠️ OPFS非対応ブラウザ");
      throw new Error("OPFS not supported");
    }
  }

  /**
   * ファイル保存
   */
  async saveFile(path: string, content: string): Promise<void> {
    if (!this.root) await this.initialize();

    const pathParts = path.split("/");
    const fileName = pathParts.pop()!;
    
    // ディレクトリ作成
    let currentDir = this.root!;
    for (const part of pathParts) {
      if (part) {
        currentDir = await currentDir.getDirectoryHandle(part, { create: true });
      }
    }

    // ファイル書き込み
    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  /**
   * ファイル読み込み
   */
  async readFile(path: string): Promise<string> {
    if (!this.root) await this.initialize();

    const pathParts = path.split("/");
    const fileName = pathParts.pop()!;
    
    let currentDir = this.root!;
    for (const part of pathParts) {
      if (part) {
        currentDir = await currentDir.getDirectoryHandle(part);
      }
    }

    const fileHandle = await currentDir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  }

  /**
   * ファイル削除
   */
  async deleteFile(path: string): Promise<void> {
    if (!this.root) await this.initialize();

    const pathParts = path.split("/");
    const fileName = pathParts.pop()!;
    
    let currentDir = this.root!;
    for (const part of pathParts) {
      if (part) {
        currentDir = await currentDir.getDirectoryHandle(part);
      }
    }

    await currentDir.removeEntry(fileName);
  }

  /**
   * すべてのファイル一覧取得
   */
  async listAllFiles(dirHandle?: FileSystemDirectoryHandle, basePath: string = ""): Promise<StoredFile[]> {
    if (!this.root) await this.initialize();
    
    const dir = dirHandle || this.root!;
    const files: StoredFile[] = [];

    for await (const entry of (dir as any).values()) {
      const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      
      if (entry.kind === "file") {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        
        files.push({
          path: currentPath,
          name: entry.name,
          content: await file.text(),
          size: file.size,
          mimeType: file.type,
          lastModified: file.lastModified,
        });
      } else if (entry.kind === "directory") {
        const subFiles = await this.listAllFiles(entry as FileSystemDirectoryHandle, currentPath);
        files.push(...subFiles);
      }
    }

    return files;
  }

  /**
   * ファイル検索
   */
  async searchFiles(query: string): Promise<StoredFile[]> {
    const allFiles = await this.listAllFiles();
    const queryLower = query.toLowerCase();
    
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(queryLower) ||
      file.content.toLowerCase().includes(queryLower)
    );
  }

  /**
   * ストレージ使用量取得
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }

  /**
   * すべて削除
   */
  async clearAll(): Promise<void> {
    if (!this.root) await this.initialize();

    for await (const entry of (this.root as any).values()) {
      await this.root!.removeEntry(entry.name, { recursive: true });
    }
  }
}

export const opfsStorage = new OPFSStorage();
