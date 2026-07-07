import { ChatSession } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAll,
}: SidebarProps) => {
  return (
    <>
      {/* トグルボタン */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-30 p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      >
        <span className="text-xl">{isOpen ? "✕" : "☰"}</span>
      </button>

      {/* サイドバー */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 z-20 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-80`}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              💬 チャット履歴
            </h2>
            <button
              onClick={onNewSession}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              ✚ 新しいチャット
            </button>
          </div>

          {/* セッション一覧 */}
          <div className="flex-1 overflow-y-auto p-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-8">
                チャット履歴がありません
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative rounded-lg border transition-colors ${
                      currentSessionId === session.id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="w-full text-left px-3 py-3"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(session.timestamp).toLocaleDateString("ja-JP")}
                        {" "}
                        {new Date(session.timestamp).toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {session.messages.length} メッセージ
                      </p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm("このセッションを削除しますか？")
                        ) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (
                  confirm(
                    "すべてのチャット履歴とキャッシュを削除しますか？この操作は元に戻せません。"
                  )
                ) {
                  onClearAll();
                }
              }}
              className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
            >
              🗑️ すべて削除
            </button>
          </div>
        </div>
      </div>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={onToggle}
        ></div>
      )}
    </>
  );
};
