import { useState, useEffect } from "react";
import { PromptTemplate, promptTemplateManager } from "../lib/prompt-templates";

interface PromptTemplateSelectorProps {
  onSelectTemplate: (template: PromptTemplate) => void;
}

export const PromptTemplateSelector = ({ onSelectTemplate }: PromptTemplateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    await promptTemplateManager.initialize();
    setTemplates(promptTemplateManager.getAllTemplates());
  };

  const categories = ["all", ...new Set(templates.map(t => t.category))];
  
  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: PromptTemplate) => {
    onSelectTemplate(template);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="プロンプトテンプレート"
      >
        <span className="text-lg">📋</span>
        <span className="text-sm font-medium text-gray-900 hidden md:inline">
          テンプレート
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-0 mt-2 w-auto md:w-[500px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                📋 プロンプトテンプレート
              </h3>

              {/* カテゴリフィルタ */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat === "all" ? "すべて" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* テンプレート一覧 */}
            <div className="p-2 overflow-y-auto flex-1">
              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  テンプレートがありません
                </p>
              ) : (
                filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all mb-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {template.name}
                          </p>
                          {template.favorite && (
                            <span className="text-yellow-500">⭐</span>
                          )}
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map(v => (
                            <span
                              key={v}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono"
                            >
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.usageCount}回使用
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* フッター */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <p className="text-xs text-gray-600">
                💡 テンプレートを選択後、変数に値を入力してください
              </p>
            </div>
          </div>

          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
};
