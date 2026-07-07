/**
 * 省エネ管理システム
 * バッテリー状態を監視し、推論速度を調整
 */

export interface PowerSettings {
  mode: "performance" | "balanced" | "power-saver";
  maxTokensPerSecond: number;
  enableBackgroundLearning: boolean;
  gpuPowerLimit: number; // 0-100
}

export class PowerManager {
  private currentMode: PowerSettings["mode"] = "balanced";
  private batteryLevel: number = 100;
  private isCharging: boolean = true;
  private listeners: Set<(settings: PowerSettings) => void> = new Set();

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    // Battery API対応チェック
    if ("getBattery" in navigator) {
      try {
        const battery = await (navigator as any).getBattery();

        this.batteryLevel = battery.level * 100;
        this.isCharging = battery.charging;

        // バッテリー状態変化を監視
        battery.addEventListener("levelchange", () => {
          this.batteryLevel = battery.level * 100;
          this.updatePowerMode();
        });

        battery.addEventListener("chargingchange", () => {
          this.isCharging = battery.charging;
          this.updatePowerMode();
        });

        this.updatePowerMode();
      } catch (error) {
        console.warn("Battery API利用不可:", error);
      }
    }
  }

  /**
   * 省エネモード自動更新
   */
  private updatePowerMode(): void {
    let newMode: PowerSettings["mode"] = "balanced";

    if (this.isCharging) {
      // 充電中はパフォーマンスモード
      newMode = "performance";
    } else {
      // バッテリー駆動時
      if (this.batteryLevel < 20) {
        newMode = "power-saver";
      } else if (this.batteryLevel < 50) {
        newMode = "balanced";
      } else {
        newMode = "performance";
      }
    }

    if (newMode !== this.currentMode) {
      this.currentMode = newMode;
      this.notifyListeners();
    }
  }

  /**
   * 手動でモード変更
   */
  setMode(mode: PowerSettings["mode"]): void {
    this.currentMode = mode;
    this.notifyListeners();
  }

  /**
   * 現在の省エネ設定を取得
   */
  getSettings(): PowerSettings {
    const settings: Record<PowerSettings["mode"], PowerSettings> = {
      performance: {
        mode: "performance",
        maxTokensPerSecond: 100,
        enableBackgroundLearning: true,
        gpuPowerLimit: 100,
      },
      balanced: {
        mode: "balanced",
        maxTokensPerSecond: 50,
        enableBackgroundLearning: true,
        gpuPowerLimit: 70,
      },
      "power-saver": {
        mode: "power-saver",
        maxTokensPerSecond: 20,
        enableBackgroundLearning: false,
        gpuPowerLimit: 40,
      },
    };

    return settings[this.currentMode];
  }

  /**
   * バッテリー情報取得
   */
  getBatteryInfo(): { level: number; charging: boolean } {
    return {
      level: this.batteryLevel,
      charging: this.isCharging,
    };
  }

  /**
   * モード変更リスナー登録
   */
  addListener(callback: (settings: PowerSettings) => void): void {
    this.listeners.add(callback);
  }

  /**
   * リスナー削除
   */
  removeListener(callback: (settings: PowerSettings) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * リスナーに通知
   */
  private notifyListeners(): void {
    const settings = this.getSettings();
    this.listeners.forEach((callback) => callback(settings));
  }

  /**
   * 推論スロットリング計算
   */
  getThrottleDelay(): number {
    const settings = this.getSettings();
    // トークン/秒から遅延ミリ秒を計算
    return Math.max(0, 1000 / settings.maxTokensPerSecond - 10);
  }

  /**
   * GPU使用率制限取得
   */
  getGPULimit(): number {
    return this.getSettings().gpuPowerLimit;
  }

  /**
   * バックグラウンド学習許可判定
   */
  shouldEnableBackgroundLearning(): boolean {
    return this.getSettings().enableBackgroundLearning;
  }
}

// シングルトンインスタンス
export const powerManager = new PowerManager();
