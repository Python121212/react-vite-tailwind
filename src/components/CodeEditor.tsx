import { useState, useRef, useEffect } from "react";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onAnalyze?: (code: string) => void;
  onRewrite?: (code: string) => void;
  onClose?: () => void;
}

export const CodeEditor = ({
  initialCode = "",
  language = "javascript",
  onAnalyze,
  onRewrite,
  onClose,
}: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(lines);
  }, [code]);

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert("コピーしました！");
    } catch (err) {
      console.error("コピーエラー:", err);
    }
  };

  const handleFormat = () => {
    // 簡易フォーマット（インデント整理）
    try {
      const lines = code.split("\n");
      let indentLevel = 0;
      const formatted = lines.map(line => {
        const trimmed = line.trim();
        
        // インデント減少
        if (trimmed.startsWith("}") || trimmed.startsWith("]") || trimmed.startsWith(")")) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const formattedLine = "  ".repeat(indentLevel) + trimmed;
        
        // インデント増加
        if (trimmed.endsWith("{") || trimmed.endsWith("[") || trimmed.endsWith("(")) {
          indentLevel++;
        }
        
        return formattedLine;
      }).join("\n");
      
      setCode(formatted);
    } catch (err) {
      console.error("フォーマットエラー:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">コードエディタ</h2>
              <p className="text-xs text-gray-500">
                {language} • {lineCount} 行 • {code.length} 文字
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* ツールバー */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-sm transition-colors"
          >
            📋 コピー
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-sm transition-colors"
          >
            💾 ダウンロード
          </button>
          <button
            onClick={handleFormat}
            className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-sm transition-colors"
          >
            ✨ フォーマット
          </button>
          
          <div className="flex-1"></div>
          
          {onAnalyze && (
            <button
              onClick={() => onAnalyze(code)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              🔍 AI解析
            </button>
          )}
          {onRewrite && (
            <button
              onClick={() => onRewrite(code)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
            >
              🤖 AI書き直し
            </button>
          )}
        </div>

        {/* エディタエリア */}
        <div className="flex-1 overflow-hidden flex">
          {/* 行番号 */}
          <div className="bg-gray-100 px-3 py-4 text-right text-xs font-mono text-gray-500 select-none overflow-y-auto">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* コードエリア */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 font-mono text-sm resize-none outline-none overflow-y-auto leading-6"
            spellCheck={false}
            style={{
              tabSize: 2,
            }}
          />
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <div>言語: {language}</div>
          <div className="hidden md:block">
            Tab でインデント | Ctrl+A で全選択 | Ctrl+C でコピー
          </div>
        </div>
      </div>
    </div>
  );
};
