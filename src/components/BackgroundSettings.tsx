import { useState, useEffect } from "react";

interface BackgroundSettingsProps {
  onBackgroundChange?: (background: string) => void;
}

export const BackgroundSettings = ({ onBackgroundChange }: BackgroundSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentBg, setCurrentBg] = useState<string>("");
  const [customImage, setCustomImage] = useState<string | null>(null);

  useEffect(() => {
    // ローカルストレージから背景設定を読み込み
    const savedBg = localStorage.getItem("app-background");
    if (savedBg) {
      setCurrentBg(savedBg);
      applyBackground(savedBg);
    }
  }, []);

  const applyBackground = (bg: string) => {
    setCurrentBg(bg);
    localStorage.setItem("app-background", bg);
    
    // bodyに直接適用（GPU/CPU使用を最小限に）
    if (bg === "none") {
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = "#f8f9fa";
    } else if (bg.startsWith("data:")) {
      // カスタム画像
      document.body.style.backgroundImage = `url(${bg})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
    } else {
      // グラデーション
      document.body.style.backgroundImage = bg;
      document.body.style.backgroundColor = "transparent";
    }

    if (onBackgroundChange) {
      onBackgroundChange(bg);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像サイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert("画像サイズは5MB以下にしてください");
      return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImage(dataUrl);
      applyBackground(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const presetBackgrounds = [
    { name: "なし", value: "none" },
    { name: "ブルーグラデーション", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "サンセット", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "オーシャン", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { name: "フォレスト", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { name: "トワイライト", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "ミッドナイト", value: "linear-gradient(135deg, #2e3192 0%, #1bffff 100%)" },
    { name: "ピーチ", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
    { name: "ラベンダー", value: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="背景設定"
      >
        <span className="text-lg">🎨</span>
        <span className="text-sm font-medium text-gray-900 hidden md:inline">
          背景設定
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 w-auto md:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              🎨 背景カスタマイズ
            </h3>

            {/* カスタム画像アップロード */}
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                カスタム画像
              </p>
              <label className="block w-full px-4 py-3 bg-white border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors text-center">
                <span className="text-sm text-gray-700">
                  📸 画像をアップロード (jpg, png, gif, webp)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-600 mt-2">
                ※ 5MB以下推奨。GPU/CPU負荷は最小限です。
              </p>
            </div>

            {/* プリセット背景 */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                プリセット背景
              </p>
              <div className="grid grid-cols-2 gap-2">
                {presetBackgrounds.map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => applyBackground(bg.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentBg === bg.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded mb-2"
                      style={{
                        background: bg.value === "none" ? "#f8f9fa" : bg.value,
                      }}
                    ></div>
                    <p className="text-xs font-medium text-gray-900 text-center">
                      {bg.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 現在の背景 */}
            {customImage && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  現在のカスタム画像
                </p>
                <div className="relative">
                  <img
                    src={customImage}
                    alt="Custom background"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setCustomImage(null);
                      applyBackground("none");
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              </div>
            )}

            {/* 注意事項 */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                💡 背景画像は静的に適用され、GPU/CPUへの負荷は最小限です。
                アニメーションGIFにも対応していますが、パフォーマンスに配慮して使用してください。
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
