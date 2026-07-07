import { useState } from "react";

interface ThinkingStep {
  id: string;
  step: number;
  content: string;
  timestamp: number;
}

interface ThinkingProcessProps {
  steps: ThinkingStep[];
  isThinking: boolean;
}

export const ThinkingProcess = ({ steps, isThinking }: ThinkingProcessProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (steps.length === 0 && !isThinking) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 my-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-2"
      >
        <div className="flex items-center gap-2">
          <span className={`text-lg ${isThinking ? "animate-pulse" : ""}`}>
            🧠
          </span>
          <span className="font-semibold text-purple-900">
            思考プロセス (Chain-of-Thought)
          </span>
          {isThinking && (
            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full animate-pulse">
              思考中...
            </span>
          )}
        </div>
        <span className="text-gray-500">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="space-y-2 mt-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white rounded-lg p-3 border border-purple-100 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {step.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(step.timestamp).toLocaleTimeString("ja-JP")}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-400 text-white rounded-full flex items-center justify-center">
                  <span className="animate-spin">⟳</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">思考中...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
