import { Artifact } from "../types";
import { ArtifactAnalyzer } from "../lib/artifact-analyzer";

interface ArtifactCardProps {
  artifact: Artifact;
}

export const ArtifactCard = ({ artifact }: ArtifactCardProps) => {
  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = artifact.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      alert("コピーしました！");
    } catch (err) {
      console.error("コピーに失敗しました:", err);
    }
  };

  const icon = ArtifactAnalyzer.getLanguageIcon(artifact.language || "text");

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-medium text-gray-900">{artifact.filename}</p>
            <p className="text-xs text-gray-500">
              {artifact.language?.toUpperCase()} • {artifact.type}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="コピー"
          >
            📋 コピー
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="ダウンロード"
          >
            💾 ダウンロード
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto">
        <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-words">
          {artifact.content}
        </pre>
      </div>
    </div>
  );
};
