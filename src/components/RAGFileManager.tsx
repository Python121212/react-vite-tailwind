import { ParsedFile } from "../lib/file-handler";

interface RAGFileManagerProps {
  files: ParsedFile[];
  activeFiles: Set<string>;
  onToggleFile: (filename: string) => void;
  onRemoveFile: (filename: string) => void;
}

export const RAGFileManager = ({
  files,
  activeFiles,
  onToggleFile,
  onRemoveFile,
}: RAGFileManagerProps) => {
  if (files.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 my-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📚</span>
          <span className="font-semibold text-gray-900">
            RAG参照ファイル ({activeFiles.size}/{files.length})
          </span>
        </div>
        <p className="text-xs text-gray-600">
          クリックで参照ON/OFF
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {files.map((file) => {
          const isActive = activeFiles.has(file.name);
          
          return (
            <div
              key={file.name}
              className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                isActive
                  ? "bg-green-100 border-green-400"
                  : "bg-gray-100 border-gray-300 opacity-50"
              }`}
            >
              <button
                onClick={() => onToggleFile(file.name)}
                className="flex items-center gap-2"
              >
                <span className={`text-lg ${isActive ? "" : "grayscale"}`}>
                  {file.extension === "pdf"
                    ? "📕"
                    : file.extension === "txt"
                    ? "📄"
                    : file.extension === "md"
                    ? "📝"
                    : file.extension === "js" || file.extension === "ts"
                    ? "📜"
                    : "📁"}
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024).toFixed(1)} KB
                    {isActive && " • 参照中"}
                  </p>
                </div>
              </button>

              <button
                onClick={() => onRemoveFile(file.name)}
                className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                title="削除"
              >
                <span className="text-xs">✕</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-green-200">
        <p className="text-xs text-gray-700">
          💡 不要なファイルをクリックして参照を外すことで、AIの応答精度が向上します。
        </p>
      </div>
    </div>
  );
};
