import { SystemStats } from "../types";

interface DashboardProps {
  stats: SystemStats;
  isOnline: boolean;
}

export const Dashboard = ({ stats, isOnline }: DashboardProps) => {
  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-4 min-w-[250px] max-w-[300px] z-10 hidden md:block">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        📊 システム状態
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            isOnline ? "bg-red-500" : "bg-green-500"
          }`}
          title={isOnline ? "オンライン" : "完全オフライン"}
        ></span>
      </h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">モデル:</span>
          <span className="font-mono text-gray-900 text-right max-w-[150px] truncate" title={stats.modelLoaded || "未ロード"}>
            {stats.modelLoaded || "未ロード"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">GPU負荷:</span>
          <span className="font-mono text-gray-900">{stats.gpuLoad}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">生成速度:</span>
          <span className="font-mono text-gray-900">{stats.generationSpeed}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">最終同期:</span>
          <span className="font-mono text-gray-900">{stats.lastSync}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>🔒</span>
          <span>完全ローカル実行中</span>
        </div>
      </div>
    </div>
  );
};
