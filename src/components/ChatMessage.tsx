import { Message } from "../types";
import { ArtifactCard } from "./ArtifactCard";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-900 border border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {isUser ? "あなた" : "AI"}
            </span>
            {message.isStreaming && (
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {/* Artifact表示 */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="mt-2">
            {message.artifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString("ja-JP")}
        </div>
      </div>
    </div>
  );
};
