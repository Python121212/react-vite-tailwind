import { useState } from "react";
import { UniversalFileHandler, ParsedFile } from "../lib/file-handler";

interface FileAttachmentProps {
  onFilesAttached: (files: ParsedFile[]) => void;
  disabled?: boolean;
  onOpenCodeEditor?: () => void;
}

export const FileAttachment = ({ onFilesAttached, disabled, onOpenCodeEditor }: FileAttachmentProps) => {
  const [attachedFiles, setAttachedFiles] = useState<ParsedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      const parsedFiles: ParsedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const parsed = await UniversalFileHandler.readFile(file);
          parsedFiles.push(parsed);
        } catch (error) {
          console.error(`ファイル ${file.name} の処理に失敗:`, error);
          alert(`${file.name} の読み込みに失敗しました`);
        }
      }

      const newFiles = [...attachedFiles, ...parsedFiles];
      setAttachedFiles(newFiles);
      onFilesAttached(newFiles);
    } finally {
      setIsProcessing(false);
      // input要素をリセット
      event.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newFiles);
    onFilesAttached(newFiles);
  };

  const handleClearAll = () => {
    setAttachedFiles([]);
    onFilesAttached([]);
  };

  return (
    <div className="w-full">
      {/* ファイル選択ボタン */}
      <div className="flex items-center gap-2 mb-2">
        <label
          className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm cursor-pointer transition-colors ${
            disabled || isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span>📎</span>
          <span>{isProcessing ? "処理中..." : "ファイル添付"}</span>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isProcessing}
            className="hidden"
            accept="*/*"
          />
        </label>

        {attachedFiles.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm transition-colors"
          >
            すべて削除
          </button>
        )}

        {onOpenCodeEditor && (
          <button
            onClick={onOpenCodeEditor}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            📝 コードエディタ
          </button>
        )}

        {attachedFiles.length > 0 && (
          <span className="text-xs text-gray-500">
            {attachedFiles.length}個のファイル
          </span>
        )}
      </div>

      {/* 添付ファイル一覧 */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm"
            >
              <span className="text-blue-700 font-medium truncate max-w-[150px]">
                {file.name}
              </span>
              <span className="text-xs text-blue-600">
                ({UniversalFileHandler["formatFileSize"](file.size)})
              </span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-red-600 hover:text-red-800 ml-1"
                title="削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
