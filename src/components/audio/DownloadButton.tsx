'use client';

import { useState } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { audioBufferToBlob, downloadBlob } from '@/lib/download-utils';
import { AudioParams } from './AudioControls';

interface DownloadButtonProps {
  audioBuffer: AudioBuffer | null;
  fileName: string;
  disabled: boolean;
  audioParams?: AudioParams;
}

export default function DownloadButton({ 
  audioBuffer, 
  fileName, 
  disabled,
  audioParams
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [format, setFormat] = useState<'wav' | 'mp3'>('wav');

  const handleDownload = async () => {
    if (!audioBuffer || disabled) return;
    
    setIsDownloading(true);
    
    try {
      const blob = await audioBufferToBlob(audioBuffer, format);
      
      // Generate a descriptive file name with the applied effects
      const baseName = fileName.split('.').slice(0, -1).join('.');
      let effectsString = '';
      
      if (audioParams) {
        const effects = [];
        
        if (audioParams.speed < 0.9) effects.push('slowed');
        if (audioParams.speed > 1.1) effects.push('sped');
        if (audioParams.pitch < 0.9) effects.push('lowered');
        if (audioParams.pitch > 1.1) effects.push('pitched');
        if (audioParams.reverb > 0.3) effects.push('reverb');
        if (audioParams.echo > 0.3) effects.push('echo');
        
        if (effects.length > 0) {
          effectsString = '_' + effects.join('-');
        }
      }
      
      const newFileName = `${baseName}${effectsString}_modified.${format}`;
      
      downloadBlob(blob, newFileName);
    } catch (error) {
      console.error('Error downloading audio:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-2 block">Format</label>
          <div className="flex rounded-md overflow-hidden border border-border/50 bg-card-bg/50">
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-medium transition-all ${
                format === 'wav' 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => setFormat('wav')}
            >
              WAV
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-medium transition-all ${
                format === 'mp3' 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => setFormat('mp3')}
            >
              MP3
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleDownload}
        disabled={disabled || !audioBuffer || isDownloading}
        className={`ai-button w-full py-3 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
          disabled || !audioBuffer || isDownloading
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
      >
        {isDownloading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles size={16} className="mr-1" />
            <Download size={18} />
            Download Enhanced Audio
          </>
        )}
      </button>
      
      <p className="mt-3 text-xs text-center text-muted-foreground">
        {disabled 
          ? 'Modify the audio to enable download' 
          : !audioBuffer 
            ? 'Upload an audio file first' 
            : 'Your AI-enhanced audio is ready to download'}
      </p>
    </div>
  );
} 