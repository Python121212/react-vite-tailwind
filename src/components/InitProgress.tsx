interface InitProgressProps {
  progress: number;
  message: string;
}

export const InitProgress = ({
  progress,
  message,
}: InitProgressProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            AIモデルを準備中...
          </h2>
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm font-semibold text-gray-900">
            {progress.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            初回ダウンロードには数分かかる場合があります
          </p>
        </div>
      </div>
    </div>
  );
};
