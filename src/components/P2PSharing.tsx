import { useState, useEffect, useRef } from "react";
import { p2pManager, SharedData } from "../lib/p2p-manager";
import { qrManager, QRConnectionData } from "../lib/qr-manager";

interface P2PSharingProps {
  currentModel: string | null;
  onReceiveData?: (data: SharedData, peerId: string) => void;
}

export const P2PSharing = ({ currentModel, onReceiveData }: P2PSharingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [targetPeerId, setTargetPeerId] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // データ受信リスナー
    const handleData = (data: SharedData, peerId: string) => {
      console.log("📥 データ受信:", data.type, "from", peerId);
      
      if (onReceiveData) {
        onReceiveData(data, peerId);
      }

      // 通知
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("データ受信", {
          body: `${peerId}から${data.type}を受信しました`,
          icon: "🔗",
        });
      }
    };

    // 接続状態リスナー
    const handleConnection = (peerId: string, connected: boolean) => {
      if (connected) {
        setConnectedPeers((prev) => [...prev, peerId]);
      } else {
        setConnectedPeers((prev) => prev.filter((id) => id !== peerId));
      }
    };

    p2pManager.onData(handleData);
    p2pManager.onConnection(handleConnection);

    return () => {
      p2pManager.offData(handleData);
      p2pManager.offConnection(handleConnection);
      
      if (streamRef.current) {
        qrManager.stopCameraStream(streamRef.current);
      }
    };
  }, [onReceiveData]);

  const handleInitialize = async () => {
    setIsInitializing(true);

    try {
      const peerId = await p2pManager.initialize();
      setMyPeerId(peerId);

      // QRコード生成
      const qr = await qrManager.generateConnectionQR(peerId, currentModel || undefined);
      setQrCode(qr);

      // 通知権限リクエスト
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch (error) {
      console.error("P2P初期化エラー:", error);
      alert("P2P接続の初期化に失敗しました");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleConnectManual = async () => {
    if (!targetPeerId.trim()) {
      alert("接続先のPeer IDを入力してください");
      return;
    }

    try {
      await p2pManager.connectToPeer(targetPeerId.trim());
      alert(`${targetPeerId}に接続しました`);
      setTargetPeerId("");
    } catch (error) {
      console.error("接続エラー:", error);
      alert("接続に失敗しました");
    }
  };

  const handleStartScanner = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await qrManager.startCameraStream(videoRef.current);
      streamRef.current = stream;
      setShowScanner(true);

      // QRコード検出
      await qrManager.readQRFromStream(
        videoRef.current,
        async (data: QRConnectionData) => {
          // カメラ停止
          if (streamRef.current) {
            qrManager.stopCameraStream(streamRef.current);
            streamRef.current = null;
          }
          setShowScanner(false);

          // 接続
          try {
            await p2pManager.connectToPeer(data.peerId);
            alert(`QRコードから接続しました: ${data.peerId}`);
          } catch (error) {
            console.error("接続エラー:", error);
            alert("接続に失敗しました");
          }
        },
        (error) => {
          console.error("QRスキャンエラー:", error);
        }
      );
    } catch (error) {
      console.error("カメラ起動エラー:", error);
      alert("カメラの起動に失敗しました");
    }
  };

  const handleStopScanner = () => {
    if (streamRef.current) {
      qrManager.stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
    setShowScanner(false);
  };

  const handleDownloadQR = () => {
    if (qrCode) {
      qrManager.downloadQR(qrCode, `p2p-qr-${myPeerId}.png`);
    }
  };

  const handleShareModel = async (peerId: string) => {
    if (!currentModel) {
      alert("共有するモデルが選択されていません");
      return;
    }

    if (confirm(`${peerId}にモデル「${currentModel}」を共有しますか？\n※数分かかる場合があります`)) {
      try {
        // 実際のモデルデータ送信は省略（デモ用）
        const demoData = new ArrayBuffer(1024);
        await p2pManager.shareModel(peerId, demoData, currentModel);
        alert("モデルの共有が完了しました");
      } catch (error) {
        console.error("モデル共有エラー:", error);
        alert("モデルの共有に失敗しました");
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="P2P共有"
      >
        <span className="text-lg">🔗</span>
        <span className="text-sm font-medium text-gray-900 hidden md:inline">
          P2P共有
        </span>
        {connectedPeers.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white text-xs rounded-full">
            {connectedPeers.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 w-auto md:w-[450px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🔗 P2P デバイス間共有
              </h3>

              {!myPeerId ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600 mb-4">
                    WebRTCを使用してスマホ間で直接通信します
                  </p>
                  <button
                    onClick={handleInitialize}
                    disabled={isInitializing}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isInitializing ? "初期化中..." : "🚀 P2P接続を開始"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* QRコード表示 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      📱 接続用QRコード
                    </p>
                    {qrCode && (
                      <div className="text-center">
                        <img
                          src={qrCode}
                          alt="QR Code"
                          className="mx-auto rounded-lg border-2 border-white shadow-lg"
                        />
                        <p className="text-xs text-gray-600 mt-2 font-mono">
                          Peer ID: {myPeerId}
                        </p>
                        <button
                          onClick={handleDownloadQR}
                          className="mt-2 px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs transition-colors"
                        >
                          💾 QRコードをダウンロード
                        </button>
                      </div>
                    )}
                  </div>

                  {/* QRスキャナー */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      📸 QRコードをスキャン
                    </p>
                    {!showScanner ? (
                      <button
                        onClick={handleStartScanner}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        📷 カメラを起動
                      </button>
                    ) : (
                      <div>
                        <video
                          ref={videoRef}
                          className="w-full rounded-lg bg-black"
                          playsInline
                        />
                        <button
                          onClick={handleStopScanner}
                          className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                        >
                          ✕ スキャン停止
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 手動接続 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      ⌨️ Peer IDで接続
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={targetPeerId}
                        onChange={(e) => setTargetPeerId(e.target.value)}
                        placeholder="Peer IDを入力"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleConnectManual}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        接続
                      </button>
                    </div>
                  </div>

                  {/* 接続中のデバイス */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      🔌 接続中のデバイス ({connectedPeers.length})
                    </p>
                    {connectedPeers.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        接続されているデバイスはありません
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {connectedPeers.map((peerId) => (
                          <div
                            key={peerId}
                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-xs font-mono text-gray-900">
                                {peerId.slice(0, 8)}...
                              </span>
                            </div>
                            <button
                              onClick={() => handleShareModel(peerId)}
                              disabled={!currentModel}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              🤖 モデル共有
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 説明 */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-900">
                      💡 P2P接続で以下を共有できます：
                      <br />• AIモデル（ダウンロード不要）
                      <br />• 学習データ
                      <br />• チャット履歴
                      <br />• 設定情報
                    </p>
                  </div>
                </div>
              )}
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
