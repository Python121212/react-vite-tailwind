/**
 * QRコード生成・読み取りマネージャー
 */

import QRCode from "qrcode";
import jsQR from "jsqr";

export interface QRConnectionData {
  peerId: string;
  modelId?: string;
  timestamp: number;
  version: string;
}

export class QRManager {
  /**
   * QRコード生成（接続情報）
   */
  async generateConnectionQR(peerId: string, modelId?: string): Promise<string> {
    const data: QRConnectionData = {
      peerId,
      modelId,
      timestamp: Date.now(),
      version: "1.0",
    };

    const jsonData = JSON.stringify(data);

    try {
      // データURLとして生成
      const qrDataUrl = await QRCode.toDataURL(jsonData, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrDataUrl;
    } catch (error) {
      console.error("QRコード生成エラー:", error);
      throw error;
    }
  }

  /**
   * QRコード生成（カスタムデータ）
   */
  async generateCustomQR(data: any): Promise<string> {
    try {
      const jsonData = JSON.stringify(data);
      
      const qrDataUrl = await QRCode.toDataURL(jsonData, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
      });

      return qrDataUrl;
    } catch (error) {
      console.error("QRコード生成エラー:", error);
      throw error;
    }
  }

  /**
   * QRコード読み取り（画像から）
   */
  async readQRFromImage(imageData: ImageData): Promise<QRConnectionData | null> {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (!code) {
        return null;
      }

      const data = JSON.parse(code.data) as QRConnectionData;
      return data;
    } catch (error) {
      console.error("QRコード読み取りエラー:", error);
      return null;
    }
  }

  /**
   * QRコード読み取り（ファイルから）
   */
  async readQRFromFile(file: File): Promise<QRConnectionData | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(null);
              return;
            }

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const data = await this.readQRFromImage(imageData);
            resolve(data);
          };

          img.onerror = () => resolve(null);
          img.src = e.target?.result as string;
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * QRコード読み取り（カメラストリームから）
   */
  async readQRFromStream(
    video: HTMLVideoElement,
    onDetect: (data: QRConnectionData) => void,
    onError?: (error: Error) => void
  ): Promise<() => void> {
    let scanning = true;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context not available");
    }

    const scan = async () => {
      if (!scanning) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        try {
          const data = await this.readQRFromImage(imageData);
          if (data) {
            onDetect(data);
            scanning = false;
            return;
          }
        } catch (error) {
          if (onError) {
            onError(error as Error);
          }
        }
      }

      requestAnimationFrame(scan);
    };

    scan();

    // 停止関数を返す
    return () => {
      scanning = false;
    };
  }

  /**
   * カメラストリーム開始
   */
  async startCameraStream(video: HTMLVideoElement): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // 背面カメラ
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      video.srcObject = stream;
      await video.play();

      return stream;
    } catch (error) {
      console.error("カメラ起動エラー:", error);
      throw error;
    }
  }

  /**
   * カメラストリーム停止
   */
  stopCameraStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  /**
   * QRコードダウンロード
   */
  downloadQR(qrDataUrl: string, filename: string = "qrcode.png"): void {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const qrManager = new QRManager();
