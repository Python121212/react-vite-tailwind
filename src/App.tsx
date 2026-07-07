import { useState, useEffect, useRef } from "react";
import { WebLLMEngine } from "./lib/webllm-engine";
import { ArtifactAnalyzer } from "./lib/artifact-analyzer";
import { storage } from "./lib/storage";
import { Message, SystemStats, ChatSession } from "./types";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { Dashboard } from "./components/Dashboard";
import { Sidebar } from "./components/Sidebar";
import { ModelSelector } from "./components/ModelSelector";
import { InitProgress } from "./components/InitProgress";
import { FileAttachment } from "./components/FileAttachment";
import { PowerSettings } from "./components/PowerSettings";
import { LearningStatus } from "./components/LearningStatus";
import { BackgroundSettings } from "./components/BackgroundSettings";
import { RAGFileManager } from "./components/RAGFileManager";
import { CodeEditor } from "./components/CodeEditor";
import { PromptTemplateSelector } from "./components/PromptTemplateSelector";
import { P2PSharing } from "./components/P2PSharing";
import { availableModels } from "./lib/webllm-engine";
import { UniversalFileHandler, ParsedFile } from "./lib/file-handler";
import { backgroundLearning } from "./lib/background-learning";
import { powerManager } from "./lib/power-management";
import { PromptTemplate } from "./lib/prompt-templates";
import { SharedData } from "./lib/p2p-manager";
import * as webllm from "@mlc-ai/web-llm";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [engine] = useState(() => new WebLLMEngine());
  const [isInitializing, setIsInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [initMessage, setInitMessage] = useState("");
  const [stats, setStats] = useState<SystemStats>({
    gpuLoad: "0%",
    generationSpeed: "0 tok/s",
    lastSync: "未同期",
    modelLoaded: null,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<ParsedFile[]>([]);
  const [activeRAGFiles, setActiveRAGFiles] = useState<Set<string>>(new Set());
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [systemPrompt] = useState("あなたは親切で有能なAIアシスタントです。");
  // setSystemPrompt は将来の設定UI用に予約
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const generationStartTime = useRef<number>(0);
  const tokenCount = useRef<number>(0);
  const throttleDelay = useRef<number>(0);

  // 初期化
  useEffect(() => {
    loadSessions();
    
    // すべての追加ファイルをアクティブに設定
    if (attachedFiles.length > 0) {
      setActiveRAGFiles(new Set(attachedFiles.map(f => f.name)));
    }
    
    // バックグラウンド学習エンジン初期化
    backgroundLearning.initialize().then(() => {
      console.log("バックグラウンド学習エンジン初期化完了");
    });
    
    // 省エネマネージャー初期化
    powerManager.initialize().then(() => {
      console.log("省エネマネージャー初期化完了");
      throttleDelay.current = powerManager.getThrottleDelay();
    });
    
    // 省エネ設定変更リスナー
    const handlePowerSettingsChange = () => {
      throttleDelay.current = powerManager.getThrottleDelay();
      
      // バックグラウンド学習の制御
      if (powerManager.shouldEnableBackgroundLearning()) {
        if (!backgroundLearning.isCurrentlyLearning()) {
          backgroundLearning.startLearning(30);
        }
      } else {
        if (backgroundLearning.isCurrentlyLearning()) {
          backgroundLearning.stopLearning();
        }
      }
    };
    
    powerManager.addListener(handlePowerSettingsChange);
    
    return () => {
      powerManager.removeListener(handlePowerSettingsChange);
    };
  }, [attachedFiles]);

  // 現在のセッションを保存
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      saveCurrentSession();
    }
  }, [messages, currentSessionId]);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // GPU統計更新
  useEffect(() => {
    const interval = setInterval(async () => {
      if (engine.isReady()) {
        try {
          const runtimeStats = await engine.getGPUInfo();
          // ランタイム統計から情報を抽出
          const lines = runtimeStats.split("\n");
          const loadLine = lines.find((l) => l.includes("GPU")) || "";
          
          setStats((prev) => ({
            ...prev,
            gpuLoad: loadLine.includes("%") ? loadLine.split(":")[1]?.trim() || "0%" : "計測中",
            modelLoaded: engine.getCurrentModel(),
          }));
        } catch (error) {
          console.error("統計取得エラー:", error);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [engine]);

  const loadSessions = async () => {
    try {
      const loadedSessions = await storage.getAllChatSessions();
      setSessions(loadedSessions);
    } catch (error) {
      console.error("セッション読み込みエラー:", error);
    }
  };

  const saveCurrentSession = async () => {
    if (!currentSessionId) return;

    const session: ChatSession = {
      id: currentSessionId,
      title: messages.find((m) => m.role === "user")?.content.slice(0, 50) || "新しいチャット",
      messages,
      timestamp: Date.now(),
    };

    try {
      await storage.saveChatSession(session);
      await loadSessions();
    } catch (error) {
      console.error("セッション保存エラー:", error);
    }
  };

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    setCurrentSessionId(newId);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectSession = async (id: string) => {
    try {
      const session = await storage.getChatSession(id);
      if (session) {
        setCurrentSessionId(id);
        setMessages(session.messages);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("セッション読み込みエラー:", error);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await storage.deleteChatSession(id);
      await loadSessions();
      if (currentSessionId === id) {
        handleNewSession();
      }
    } catch (error) {
      console.error("セッション削除エラー:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await storage.clearAllData();
      await loadSessions();
      handleNewSession();
    } catch (error) {
      console.error("データ削除エラー:", error);
    }
  };

  const handleP2PData = (data: SharedData, peerId: string) => {
    console.log("📥 P2Pデータ受信:", data.type, "from", peerId);

    switch (data.type) {
      case "knowledge":
        // 学習データを受信
        alert(`${peerId}から学習データを受信しました（${data.data.length}件）`);
        // backgroundLearning に保存する処理を追加可能
        break;

      case "chat":
        // チャット履歴を受信
        alert(`${peerId}からチャット履歴を受信しました（${data.data.length}メッセージ）`);
        // メッセージをインポート可能
        break;

      case "settings":
        // 設定を受信
        alert(`${peerId}から設定を受信しました`);
        break;

      case "model":
        // モデルデータを受信（チャンク）
        console.log("モデルチャンク受信:", data.data.chunkIndex, "/", data.data.totalChunks);
        break;

      default:
        console.log("未知のデータタイプ:", data.type);
    }
  };

  const handleSelectModel = async (modelId: string) => {
    setIsInitializing(true);
    setInitProgress(0);
    setInitMessage("モデルをダウンロード中...");

    try {
      await engine.initialize(
        modelId,
        (report: webllm.InitProgressReport) => {
          setInitProgress(report.progress * 100);
          setInitMessage(report.text);
        }
      );

      setStats((prev) => ({
        ...prev,
        modelLoaded: modelId,
      }));

      // 初回セッション作成
      if (!currentSessionId) {
        handleNewSession();
      }
    } catch (error) {
      console.error("モデル初期化エラー:", error);
      alert("モデルの初期化に失敗しました: " + (error as Error).message);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!engine.isReady()) {
      alert("モデルを選択してください");
      return;
    }

    if (!currentSessionId) {
      handleNewSession();
    }

    // ファイル添付がある場合、アクティブなファイルのみ追加
    let fullContent = content;
    if (attachedFiles.length > 0) {
      const activeFiles = attachedFiles.filter(f => activeRAGFiles.has(f.name));
      if (activeFiles.length > 0) {
        fullContent += "\n\n--- 添付ファイル ---\n";
        for (const file of activeFiles) {
          fullContent += `\n${UniversalFileHandler.summarizeFile(file)}\n`;
        }
      }
    }

    // バックグラウンド学習から関連知識を取得
    try {
      const relatedKnowledge = await backgroundLearning.searchKnowledge(content, 3);
      if (relatedKnowledge.length > 0) {
        fullContent += "\n\n--- 関連する最新情報 ---\n";
        for (const knowledge of relatedKnowledge) {
          fullContent += `\n【${knowledge.source}】${knowledge.title}\n${knowledge.content.slice(0, 200)}...\n`;
        }
      }
    } catch (error) {
      console.error("関連知識の取得エラー:", error);
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    generationStartTime.current = Date.now();
    tokenCount.current = 0;
    
    // ファイル添付をクリア
    setAttachedFiles([]);

    // AI応答メッセージを作成
    const assistantMessageId = `msg-${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // チャット履歴を準備（システムプロンプト付き）
      const chatHistory = [
        { role: "system" as const, content: systemPrompt },
        ...messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
      ];

      chatHistory.push({ role: "user" as const, content: fullContent });

      // ストリーミング生成（省エネモード対応）
      let finalResponse = "";
      let lastUpdateTime = Date.now();
      
      await engine.chat(chatHistory, (partialResponse) => {
        finalResponse = partialResponse;
        tokenCount.current++;
        
        // 省エネモード時のスロットリング
        const now = Date.now();
        if (now - lastUpdateTime < throttleDelay.current) {
          return; // UI更新をスキップ
        }
        lastUpdateTime = now;
        
        const elapsed = (now - generationStartTime.current) / 1000;
        const speed = (tokenCount.current / elapsed).toFixed(1);

        setStats((prev) => ({
          ...prev,
          generationSpeed: `${speed} tok/s`,
        }));

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: partialResponse }
              : msg
          )
        );
      });

      // 生成完了後、Artifactを抽出
      const artifacts = ArtifactAnalyzer.extractArtifacts(finalResponse);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, artifacts, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error("生成エラー:", error);
      alert("メッセージの生成中にエラーが発生しました");
    } finally {
      setIsGenerating(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 初期化プログレス */}
      {isInitializing && (
        <InitProgress progress={initProgress} message={initMessage} />
      )}

      {/* サイドバー */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
      />

      {/* ダッシュボード */}
      <Dashboard stats={stats} isOnline={false} />

      {/* メインコンテンツ */}
      <div className="flex flex-col h-screen pt-4">
        {/* ヘッダー */}
        <div className="flex-shrink-0 px-4 pb-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between gap-2 md:gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                🤖 次世代型ローカルAI
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <P2PSharing
                currentModel={stats.modelLoaded}
                onReceiveData={handleP2PData}
              />
              <PromptTemplateSelector
                onSelectTemplate={(template: PromptTemplate) => {
                  // テンプレート選択時の処理は後で実装
                  console.log("Template selected:", template);
                }}
              />
              <BackgroundSettings />
              <LearningStatus learningEngine={backgroundLearning} />
              <PowerSettings powerManager={powerManager} />
              <ModelSelector
                currentModel={stats.modelLoaded}
                onSelectModel={handleSelectModel}
                isLoading={isInitializing}
              />
            </div>
          </div>
          
          {/* モバイル用システム情報 */}
          <div className="md:hidden mt-3 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">モデル:</span>
                <span className="font-mono text-gray-900 truncate max-w-[120px]" title={stats.modelLoaded || "未ロード"}>
                  {stats.modelLoaded ? stats.modelLoaded.split("-").slice(0, 2).join("-") : "未ロード"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">速度:</span>
                <span className="font-mono text-gray-900">{stats.generationSpeed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* チャットエリア */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            {/* RAGファイルマネージャー */}
            {attachedFiles.length > 0 && (
              <RAGFileManager
                files={attachedFiles}
                activeFiles={activeRAGFiles}
                onToggleFile={(filename) => {
                  const newActive = new Set(activeRAGFiles);
                  if (newActive.has(filename)) {
                    newActive.delete(filename);
                  } else {
                    newActive.add(filename);
                  }
                  setActiveRAGFiles(newActive);
                }}
                onRemoveFile={(filename) => {
                  setAttachedFiles(prev => prev.filter(f => f.name !== filename));
                  const newActive = new Set(activeRAGFiles);
                  newActive.delete(filename);
                  setActiveRAGFiles(newActive);
                }}
              />
            )}

            {messages.length === 0 ? (
              <div className="text-center mt-10 md:mt-20 px-4">
                <div className="text-6xl mb-4 animate-bounce">🚀</div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  次世代型ローカルAI
                </h2>
                <p className="text-gray-600 mb-2 max-w-2xl mx-auto">
                  WebGPUを利用した完全ブラウザ内実行型AIチャットシステム<br />
                  プライバシー保護・オフライン動作・高速推論を実現
                </p>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full mb-8">
                  <span className="text-2xl">🤖</span>
                  <span className="font-semibold text-gray-900">{availableModels.length}種類のAIモデル</span>
                  <span className="text-gray-600">から選択可能</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-3xl mb-2">🔒</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      完全プライベート
                    </h3>
                    <p className="text-sm text-gray-600">
                      すべての処理がブラウザ内で完結。データは外部に送信されません
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-3xl mb-2">⚡</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      高速推論
                    </h3>
                    <p className="text-sm text-gray-600">
                      WebGPUによる並列処理で、ローカルでも高速な応答を実現
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-3xl mb-2">📁</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      自動ファイル化
                    </h3>
                    <p className="text-sm text-gray-600">
                      コード生成時は自動検出し、ダウンロード可能なArtifactとして出力
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-3xl mb-2">💾</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      永続化対応
                    </h3>
                    <p className="text-sm text-gray-600">
                      チャット履歴はIndexedDBに保存。次回アクセス時も継続可能
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-md mx-auto border border-blue-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
                    <span>📋</span> 使い方
                  </h3>
                  <ol className="text-sm text-gray-700 text-left space-y-2.5">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600 min-w-[20px]">1.</span>
                      <span>右上の「モデル選択」から使用するAIモデルを選択</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600 min-w-[20px]">2.</span>
                      <span>初回はモデルのダウンロードが必要です（数分程度）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600 min-w-[20px]">3.</span>
                      <span>ダウンロード完了後、自由にメッセージを送信できます</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600 min-w-[20px]">4.</span>
                      <span>コード生成時は自動でファイルカードが生成されます</span>
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* 入力エリア */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent pt-4 pb-4 px-4">
          <div className="max-w-4xl mx-auto">
            <FileAttachment
              onFilesAttached={setAttachedFiles}
              disabled={!engine.isReady() || isGenerating}
              onOpenCodeEditor={() => {
                setEditorCode("");
                setShowCodeEditor(true);
              }}
            />
            <ChatInput
              onSend={handleSendMessage}
              disabled={!engine.isReady() || isGenerating}
              placeholder={
                !engine.isReady()
                  ? "モデルを選択してください..."
                  : isGenerating
                  ? "生成中..."
                  : "メッセージを入力..."
              }
            />
          </div>
        </div>
      </div>

      {/* コードエディタモーダル */}
      {showCodeEditor && (
        <CodeEditor
          initialCode={editorCode}
          language="javascript"
          onAnalyze={(code) => {
            setShowCodeEditor(false);
            handleSendMessage(`以下のコードを解析してください：\n\n\`\`\`\n${code}\n\`\`\``);
          }}
          onRewrite={(code) => {
            setShowCodeEditor(false);
            handleSendMessage(`以下のコードをリファクタリングしてください：\n\n\`\`\`\n${code}\n\`\`\``);
          }}
          onClose={() => setShowCodeEditor(false)}
        />
      )}
    </div>
  );
}

export default App;
