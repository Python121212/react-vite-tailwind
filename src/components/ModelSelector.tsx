import { useState } from "react";
import { availableModels } from "../lib/webllm-engine";
import { getModelInfo } from "../lib/model-info";

interface ModelSelectorProps {
  currentModel: string | null;
  onSelectModel: (model: string) => void;
  isLoading: boolean;
}

export const ModelSelector = ({
  currentModel,
  onSelectModel,
  isLoading,
}: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleSelect = (model: string) => {
    onSelectModel(model);
    setIsOpen(false);
  };
  
  // モデルをフィルタリング
  const filteredModels = availableModels.filter((model) => {
    const info = getModelInfo(model);
    const matchesSearch = model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          info.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || info.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // カテゴリ一覧を取得
  const categories = ["all", ...Array.from(new Set(availableModels.map(m => getModelInfo(m).category).filter((c): c is string => Boolean(c))))];
  
  // 推奨モデルを先頭に
  const sortedModels = [...filteredModels].sort((a, b) => {
    const infoA = getModelInfo(a);
    const infoB = getModelInfo(b);
    if (infoA.recommended && !infoB.recommended) return -1;
    if (!infoA.recommended && infoB.recommended) return 1;
    return 0;
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
          🤖 {currentModel ? currentModel.split("-").slice(0, 2).join("-") : "モデル選択"}
        </span>
        <span className="text-gray-500 text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-0 md:right-auto mt-2 w-full md:w-[500px] bg-white border border-gray-200 rounded-xl shadow-xl max-h-[80vh] flex flex-col z-50">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              AIモデル選択 ({sortedModels.length}個)
            </h3>
            
            {/* 検索バー */}
            <input
              type="text"
              placeholder="モデル名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            
            {/* カテゴリフィルタ */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => {
                const icon = 
                  cat === "all" ? "🌐" :
                  cat === "汎用" ? "💬" :
                  cat === "コーディング" ? "💻" :
                  cat === "数学" ? "🔢" :
                  cat === "軽量" ? "⚡" : "🤖";
                
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                      categoryFilter === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {icon} {cat === "all" ? "すべて" : cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-2 overflow-y-auto flex-1">
            {sortedModels.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                該当するモデルが見つかりません
              </p>
            ) : (
              sortedModels.map((model) => {
              const info = getModelInfo(model);
              return (
                <button
                  key={model}
                  onClick={() => handleSelect(model)}
                  disabled={isLoading}
                  className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2 ${
                    currentModel === model ? "bg-blue-50 border border-blue-200" : "border border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {info?.name || model.split("-").slice(0, 3).join("-")}
                        </span>
                        {info?.recommended && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                            ⭐ 推奨
                          </span>
                        )}
                        {info?.category && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            {info.category}
                          </span>
                        )}
                      </div>
                      {info && (
                        <>
                          <p className="text-xs text-gray-600 mt-1">
                            {info.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            サイズ: {info.size}
                          </p>
                        </>
                      )}
                    </div>
                    {currentModel === model && (
                      <span className="text-xs text-blue-600 font-semibold whitespace-nowrap">
                        ✓ 使用中
                      </span>
                    )}
                  </div>
                </button>
              );
            })
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};
