import { useState, useEffect } from "react";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span className="text-sm font-semibold">
          📴 オフラインモード - すべての機能が利用可能です
        </span>
      </div>
    </div>
  );
};
