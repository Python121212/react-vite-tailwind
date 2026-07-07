import { useState, useEffect } from "react";
import { BackgroundLearningEngine } from "../lib/background-learning";

interface LearningStatusProps {
  learningEngine: BackgroundLearningEngine;
}

export const LearningStatus = ({ learningEngine }: LearningStatusProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [knowledgeCount, setKnowledgeCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // オンライン/オフライン状態監視
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 知識カウント更新
    const updateCount = async () => {
      try {
        const count = await learningEngine.getKnowledgeCount();
        setKnowledgeCount(count);
      } catch (error) {
        console.error("知識カウント取得エラー:", error);
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [learningEngine]);

  useEffect(() => {
    setIsLearning(learningEngine.isCurrentlyLearning());
  }, [learningEngine]);

  const handleToggleLearning = () => {
    if (isLearning) {
      learningEngine.stopLearning();
      setIsLearning(false);
    } else {
      learningEngine.startLearning(30); // 30分ごと
      setIsLearning(true);
    }
  };

  const handleClearKnowledge = async () => {
    if (confirm("すべての学習データを削除しますか？")) {
      await learningEngine.clearKnowledge();
      setKnowledgeCount(0);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg transition-colors ${
          isLearning
            ? "bg-green-50 border-green-300 hover:bg-green-100"
            : "bg-white hover:bg-gray-50"
        }`}
        title="バックグラウンド学習"
      >
        <span className={`text-lg ${isLearning ? "animate-pulse" : ""}`}>
          🎓
        </span>
        <span className="text-sm font-medium text-gray-900 hidden md:inline">
          {isLearning ? "学習中" : "学習停止"}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 w-auto md:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🎓 バックグラウンド学習
              {isLearning && (
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </h3>

            {/* オンライン状態 */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">ネットワーク状態</span>
                <span
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${
                    isOnline ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {isOnline ? "オンライン" : "オフライン"}
                </span>
              </div>
            </div>

            {/* 学習状態 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    学習状態
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {isLearning
                      ? "最新情報を自動収集中"
                      : "学習を停止しています"}
                  </p>
                </div>
                <button
                  onClick={handleToggleLearning}
                  disabled={!isOnline && !isLearning}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isLearning
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  }`}
                >
                  {isLearning ? "停止" : "開始"}
                </button>
              </div>

              {!isOnline && !isLearning && (
                <p className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                  ⚠️ オフライン時は学習を開始できません
                </p>
              )}
            </div>

            {/* 収集データ統計 */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">収集済み知識</span>
                <span className="font-mono font-semibold text-gray-900">
                  {knowledgeCount.toLocaleString()} 件
                </span>
              </div>
            </div>

            {/* 収集ソース */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                データソース:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded px-2 py-1.5 text-xs text-gray-600">
                  📰 GitHub Trending
                </div>
                <div className="bg-gray-50 rounded px-2 py-1.5 text-xs text-gray-600">
                  🏆 HackerNews
                </div>
                <div className="bg-gray-50 rounded px-2 py-1.5 text-xs text-gray-600">
                  📚 Wikipedia
                </div>
                <div className="bg-gray-50 rounded px-2 py-1.5 text-xs text-gray-600">
                  🌐 NewsAPI
                </div>
              </div>
            </div>

            {/* 説明 */}
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-900">
                💡 バックグラウンド学習は、最新の技術トレンド、ニュース、スポーツ情報などを自動収集し、AIの回答精度を向上させます。
              </p>
            </div>

            {/* データ管理 */}
            <div className="border-t border-gray-200 pt-3">
              <button
                onClick={handleClearKnowledge}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                🗑️ 学習データをすべて削除
              </button>
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
