import { useState, useEffect } from "react";
import { showInstallPrompt, isPWAInstalled } from "../registerSW";

export const PWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // インストール済みチェック
    setIsInstalled(isPWAInstalled());

    // インストールプロンプトイベント
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    
    if (accepted) {
      setCanInstall(false);
      setIsInstalled(true);
      alert("アプリをインストールしました！");
    }
  };

  if (isInstalled) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 border border-green-300 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <span className="text-sm font-medium text-green-900">
            PWAインストール済み
          </span>
        </div>
      </div>
    );
  }

  if (!canInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 shadow-xl z-50 max-w-sm">
      <button
        onClick={() => setCanInstall(false)}
        className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center"
      >
        ✕
      </button>
      
      <div className="mb-3">
        <h3 className="font-bold text-lg mb-1">📱 アプリをインストール</h3>
        <p className="text-sm opacity-90">
          ホーム画面に追加して、いつでもすばやくアクセス！
        </p>
      </div>

      <ul className="text-xs space-y-1 mb-4 opacity-90">
        <li>✓ オフライン対応</li>
        <li>✓ ホーム画面から起動</li>
        <li>✓ 通知機能</li>
        <li>✓ 高速起動</li>
      </ul>

      <button
        onClick={handleInstall}
        className="w-full bg-white text-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
      >
        インストール
      </button>
    </div>
  );
};
