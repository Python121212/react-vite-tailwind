import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSend,
  disabled,
  placeholder = "メッセージを入力...",
}: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // 自動サイズ調整
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-300 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-end gap-2 p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="flex-1 resize-none outline-none text-gray-900 placeholder-gray-400 disabled:opacity-50 max-h-[200px] overflow-y-auto"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm whitespace-nowrap"
            >
              送信 ▲
            </button>
          </div>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">
            Shift + Enter で改行 | Enter で送信
          </p>
        </div>
    </div>
  );
};
