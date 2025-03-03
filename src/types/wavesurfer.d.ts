declare module 'wavesurfer.js' {
  interface WaveSurferOptions {
    container: HTMLElement;
    waveColor?: string;
    progressColor?: string;
    cursorColor?: string;
    cursorWidth?: number;
    height?: number;
    barWidth?: number;
    barGap?: number;
    barRadius?: number;
    normalize?: boolean;
    backend?: string;
    peaks?: any;
  }

  interface WaveSurfer {
    create(options: WaveSurferOptions): WaveSurfer;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    playPause(): void;
    play(): void;
    pause(): void;
    stop(): void;
    getDuration(): number;
    getCurrentTime(): number;
    loadBlob(blob: Blob): Promise<void>;
  }

  const WaveSurfer: {
    create(options: WaveSurferOptions): WaveSurfer;
  };

  export default WaveSurfer;
} 