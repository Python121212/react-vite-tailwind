/**
 * Service Worker登録
 * PWAオフライン対応
 */

import { registerSW } from "virtual:pwa-register";

export function registerServiceWorker() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // 新しいバージョンが利用可能
      if (confirm("新しいバージョンが利用可能です。更新しますか？")) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log("✅ オフライン対応完了");
      
      // オフライン通知
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("オフライン対応完了", {
          body: "アプリをオフラインでも使用できます",
          icon: "/icon-192.png",
        });
      }
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      console.log("✅ Service Worker登録完了");
      
      // 定期的な更新チェック（1時間ごと）
      setInterval(() => {
        registration?.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error: Error) {
      console.error("❌ Service Worker登録エラー:", error);
    },
  });

  // ネットワーク状態の監視
  window.addEventListener("online", () => {
    console.log("🌐 オンラインに接続しました");
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("オンライン", {
        body: "インターネットに接続しました",
        icon: "/icon-192.png",
      });
    }
  });

  window.addEventListener("offline", () => {
    console.log("📴 オフラインモードに切り替わりました");
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("オフライン", {
        body: "オフラインモードで動作しています",
        icon: "/icon-192.png",
      });
    }
  });

  return updateSW;
}

// インストールプロンプトの表示
let deferredPrompt: any = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // インストールボタンを表示
  const installButton = document.getElementById("install-button");
  if (installButton) {
    installButton.style.display = "block";
  }
});

export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  deferredPrompt = null;
  
  return outcome === "accepted";
}

// インストール済みかチェック
export function isPWAInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}
