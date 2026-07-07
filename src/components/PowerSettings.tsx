import { useState, useEffect } from "react";
import { PowerManager, PowerSettings as PowerSettingsType } from "../lib/power-management";

interface PowerSettingsProps {
  powerManager: PowerManager;
  onSettingsChange?: (settings: PowerSettingsType) => void;
}

export const PowerSettings = ({ powerManager, onSettingsChange }: PowerSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PowerSettingsType>(powerManager.getSettings());
  const [batteryInfo, setBatteryInfo] = useState(powerManager.getBatteryInfo());

  useEffect(() => {
    const handleSettingsChange = (newSettings: PowerSettingsType) => {
      setSettings(newSettings);
      if (onSettingsChange) {
        onSettingsChange(newSettings);
      }
    };

    powerManager.addListener(handleSettingsChange);

    // バッテリー情報を定期更新
    const interval = setInterval(() => {
      setBatteryInfo(powerManager.getBatteryInfo());
    }, 5000);

    return () => {
      powerManager.removeListener(handleSettingsChange);
      clearInterval(interval);
    };
  }, [powerManager, onSettingsChange]);

  const handleModeChange = (mode: PowerSettingsType["mode"]) => {
    powerManager.setMode(mode);
  };

  const getModeIcon = (mode: PowerSettingsType["mode"]) => {
    switch (mode) {
      case "performance":
        return "⚡";
      case "balanced":
        return "⚖️";
      case "power-saver":
        return "🔋";
    }
  };

  const getBatteryIcon = () => {
    if (batteryInfo.charging) return "🔌";
    if (batteryInfo.level > 80) return "🔋";
    if (batteryInfo.level > 50) return "🔋";
    if (batteryInfo.level > 20) return "🪫";
    return "🪫";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="省エネ設定"
      >
        <span className="text-lg">{getModeIcon(settings.mode)}</span>
        <span className="text-sm font-medium text-gray-900 hidden md:inline">
          省エネ設定
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 w-auto md:w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              ⚙️ 省エネ設定
            </h3>

            {/* バッテリー状態 */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">バッテリー</span>
                <span className="text-2xl">{getBatteryIcon()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    batteryInfo.level > 50
                      ? "bg-green-500"
                      : batteryInfo.level > 20
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${batteryInfo.level}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{batteryInfo.level.toFixed(0)}%</span>
                <span>{batteryInfo.charging ? "充電中" : "バッテリー駆動"}</span>
              </div>
            </div>

            {/* モード選択 */}
            <div className="space-y-2">
              <button
                onClick={() => handleModeChange("performance")}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  settings.mode === "performance"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    パフォーマンス
                  </span>
                  {settings.mode === "performance" && (
                    <span className="text-blue-600 text-xs">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  最高速度で動作。バッテリー消費大
                </p>
              </button>

              <button
                onClick={() => handleModeChange("balanced")}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  settings.mode === "balanced"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">⚖️</span>
                    バランス
                  </span>
                  {settings.mode === "balanced" && (
                    <span className="text-blue-600 text-xs">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  速度と省エネのバランス。推奨
                </p>
              </button>

              <button
                onClick={() => handleModeChange("power-saver")}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  settings.mode === "power-saver"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">🔋</span>
                    省エネ
                  </span>
                  {settings.mode === "power-saver" && (
                    <span className="text-blue-600 text-xs">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  バッテリー優先。速度は低下
                </p>
              </button>
            </div>

            {/* 現在の設定詳細 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>最大速度:</span>
                  <span className="font-mono">
                    {settings.maxTokensPerSecond} tok/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GPU制限:</span>
                  <span className="font-mono">{settings.gpuPowerLimit}%</span>
                </div>
                <div className="flex justify-between">
                  <span>バックグラウンド学習:</span>
                  <span className="font-mono">
                    {settings.enableBackgroundLearning ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
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
