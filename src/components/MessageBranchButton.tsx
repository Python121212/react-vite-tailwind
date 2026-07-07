interface MessageBranchButtonProps {
  messageId: string;
  onCreateBranch: (messageId: string) => void;
  branchCount?: number;
}

export const MessageBranchButton = ({
  messageId,
  onCreateBranch,
  branchCount = 0,
}: MessageBranchButtonProps) => {
  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={() => onCreateBranch(messageId)}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs transition-colors"
        title="ここから別ルートを試す"
      >
        <span>🌿</span>
        <span>ここから分岐</span>
      </button>

      {branchCount > 0 && (
        <span className="text-xs text-gray-500">
          {branchCount}個の分岐
        </span>
      )}
    </div>
  );
};
