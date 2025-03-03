'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal, Wand2, Sparkles, Zap, Info, X, FastForward, Music, Download, Loader2, Upload, Sliders, Check } from 'lucide-react';
import AudioUploader from '@/components/audio/AudioUploader';
import AudioWaveform from '@/components/audio/AudioWaveformNew';
import AudioControls, { AudioParams } from '@/components/audio/AudioControls';
import { AudioProcessor } from '@/lib/audio-processor';
import { audioBufferToBlob, downloadBlob } from '@/lib/download-utils';
import Link from 'next/link';
import * as Tabs from '@radix-ui/react-tabs';

// Function to convert AudioBuffer to WAV format
function audioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numberOfChannels * 2 + 44;
  const sampleRate = audioBuffer.sampleRate;
  
  const wav = new ArrayBuffer(length);
  const view = new DataView(wav);
  
  // Write WAV header
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, length - 8, true);
  writeString(view, 8, 'WAVE');
  
  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (1 for PCM)
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true); // byte rate
  view.setUint16(32, numberOfChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  
  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length - 44, true);
  
  // Write audio data
  const offset = 44;
  const channelData = [];
  
  // Extract channel data
  for (let i = 0; i < numberOfChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }
  
  // Interleave channel data and convert to 16-bit PCM
  let dataIndex = 0;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      // Apply a small amount of compression to avoid clipping
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      
      // Apply a slight normalization to ensure good volume levels
      const normalizedSample = sample * 0.95;
      
      // Convert to 16-bit PCM with proper rounding
      const int16Sample = normalizedSample < 0 
        ? Math.max(-32768, Math.round(normalizedSample * 32768)) 
        : Math.min(32767, Math.round(normalizedSample * 32767));
      
      view.setInt16(offset + dataIndex, int16Sample, true);
      dataIndex += 2;
    }
  }
  
  return wav;
}

// Helper function to write strings to DataView
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export default function Home() {
  const [originalAudioBuffer, setOriginalAudioBuffer] = useState<AudioBuffer | null>(null);
  const [modifiedAudioBuffer, setModifiedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [currentParams, setCurrentParams] = useState<AudioParams | null>(null);
  const [showAdBanner, setShowAdBanner] = useState(true);
  const [format, setFormat] = useState<'wav' | 'mp3'>('wav');
  const [isDownloading, setIsDownloading] = useState(false);
  const audioProcessor = useRef<AudioProcessor | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [isClient, setIsClient] = useState(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioProcessor.current) {
        audioProcessor.current.dispose();
      }
      
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Reset download state when audio changes
  useEffect(() => {
    setIsDownloading(false);
  }, [originalAudioBuffer]);

  // Check if cookie consent has been given - only run on client side
  useEffect(() => {
    setIsClient(true);
    
    // Initialize audio processor when needed, not on mount
    
    // Check cookie consent
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookieConsent');
      if (consent === null) {
        setShowCookieConsent(true);
      }
    }
  }, []);
  
  // Handle cookie consent
  const handleCookieConsent = useCallback((accepted: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'declined');
      setShowCookieConsent(false);
    }
  }, []);

  const handleAudioUpload = useCallback((buffer: AudioBuffer, name: string) => {
    // Initialize audio processor with the uploaded buffer
    if (typeof window !== 'undefined') {
      audioProcessor.current = new AudioProcessor(buffer);
      audioProcessor.current.setupEffectChain();
    }
    
    setOriginalAudioBuffer(buffer);
    setModifiedAudioBuffer(buffer);
    setFileName(name);
    setActiveTab('edit'); // Automatically switch to edit tab after upload
  }, []);

  const handleParamsChange = useCallback(async (params: AudioParams) => {
    if (!originalAudioBuffer || !audioProcessor.current) return;
    
    setCurrentParams(params);
    setIsProcessing(true);
    
    try {
      // Process audio with new parameters
      const processed = await audioProcessor.current.processAudio(params);
      setModifiedAudioBuffer(processed);
      
      // Set modified flag if any parameter is different from default
      const isAnyParamModified = 
        params.speed !== 1 || 
        params.pitch !== 1 || 
        params.volume !== 1 || 
        params.reverb !== 0 || 
        params.echo !== 0;
      
      setIsModified(isAnyParamModified);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [originalAudioBuffer]);

  const handlePlaybackPositionChange = (position: number) => {
    // Sync playback position between waveforms if needed
    if (audioProcessor.current && position >= 0) {
      // Could be used to sync original and modified waveforms in the future
    }
  };

  const handleDownload = useCallback(async (selectedFormat: 'wav' | 'mp3') => {
    if (!modifiedAudioBuffer) return;
    
    setIsDownloading(true);
    try {
      const blob = await audioBufferToBlob(modifiedAudioBuffer, selectedFormat);
      
      // Generate a descriptive file name with the applied effects
      const baseName = fileName.split('.').slice(0, -1).join('.');
      let effectsString = '';
      
      if (currentParams) {
        const effects = [];
        
        if (currentParams.speed < 0.9) effects.push('slowed');
        if (currentParams.speed > 1.1) effects.push('sped');
        if (currentParams.pitch < 0.9) effects.push('lowered');
        if (currentParams.pitch > 1.1) effects.push('pitched');
        if (currentParams.reverb > 0.3) effects.push('reverb');
        if (currentParams.echo > 0.3) effects.push('echo');
        
        if (effects.length > 0) {
          effectsString = '_' + effects.join('-');
        }
      }
      
      const newFileName = `${baseName}${effectsString}_modified.${selectedFormat}`;
      
      downloadBlob(blob, newFileName);
    } catch (error) {
      console.error('Error downloading audio:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [modifiedAudioBuffer, fileName, currentParams]);

  if (!isClient) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-5xl mx-auto">
          <div className="w-full h-[400px] flex items-center justify-center">
            <p>Loading application...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border/40 py-4 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <Sparkles className="text-primary ai-pulse" size={28} />
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                </div>
                <h1 className="text-xl font-bold">
                  <span className="logo-text">Audio</span>
                  <span className="ai-studio-box">AI Studio</span>
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Terminal size={16} />
              <span className="text-xs">v1.1.0</span>
            </div>
          </div>
        </div>
      </header>
      
      {showAdBanner && (
        <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 p-0.5 relative">
          <div className="bg-card-bg/90 py-2 px-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Info size={14} className="text-primary" />
                <span>
                  <span className="font-medium">Advertise here!</span> Contact us at <a href="mailto:ads@audioaistudio.com" className="text-primary hover:underline">ads@audioaistudio.com</a>
                </span>
              </div>
              <button 
                onClick={() => setShowAdBanner(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Feature Box - Only show when no audio is uploaded */}
          {!originalAudioBuffer && (
            <div className="mb-8 ai-card relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="text-primary" size={20} />
                <span>Audio AI Studio Features</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="text-primary" size={16} />
                    <span className="text-sm font-medium">Slowed + Reverb</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Create popular slowed and reverb effects with one click</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <FastForward className="text-primary" size={16} />
                    <span className="text-sm font-medium">Speed Control</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Speed up or slow down your audio with pitch correction</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Music className="text-primary" size={16} />
                    <span className="text-sm font-medium">Nightcore Effects</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Create energetic nightcore versions of your favorite tracks</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Box - Make it smaller when audio is uploaded */}
          {!originalAudioBuffer ? (
            <div className="mb-8 ai-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="text-primary" size={20} />
                <span>Upload Audio</span>
              </h2>
              <AudioUploader onAudioUpload={handleAudioUpload} />
            </div>
          ) : (
            <div className="relative">
              {/* New Audio button removed from here */}
            </div>
          )}
          
          {originalAudioBuffer && (
            <>
              <div className="mb-8 ai-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Wand2 className="text-secondary" size={20} />
                    <span>Audio Waveform</span>
                  </h2>
                </div>
                
                <div className={`waveform-container relative ${isProcessing ? 'processing-glow processing-shadow' : ''}`}>
                  <AudioWaveform 
                    audioBuffer={modifiedAudioBuffer || originalAudioBuffer}
                    onPlaybackPositionChange={handlePlaybackPositionChange}
                  />
                </div>
                
                {/* Format selector and download info in a small row below waveform */}
                <div className="audio-action-buttons mt-4">
                  {/* New Audio button */}
                  <button
                    onClick={() => {
                      if (audioProcessor.current) {
                        audioProcessor.current.dispose();
                      }
                      setOriginalAudioBuffer(null);
                      setModifiedAudioBuffer(null);
                      setFileName('');
                      setIsModified(false);
                      setCurrentParams(null);
                    }}
                    className="ai-button"
                  >
                    <Upload size={14} className="mr-1" />
                    New Audio
                  </button>
                  
                  {/* Download button */}
                  {isModified && modifiedAudioBuffer && (
                    <button
                      onClick={() => handleDownload(format)}
                      disabled={isProcessing || isDownloading}
                      className="ai-button ml-2"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 size={14} className="animate-spin mr-1" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download size={14} className="mr-1" />
                          Download {format.toUpperCase()}
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Format selector */}
                {isModified && (
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Format:</span>
                      <div className="flex rounded-md overflow-hidden border border-border/50 bg-card-bg/50">
                        <button
                          type="button"
                          className={`px-2 py-1 transition-all ${
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
                          className={`px-2 py-1 transition-all ${
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
                    <span className="text-muted-foreground">
                      {isDownloading ? 'Processing download...' : 'Your AI-enhanced audio is ready'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ai-card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="text-primary" size={20} />
                  <span>AI Audio Controls</span>
                </h2>
                
                <AudioControls 
                  onParamsChange={handleParamsChange}
                  disabled={!originalAudioBuffer}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Cookie Consent Banner - Only render on client side */}
      {isClient && showCookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 p-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-1">Cookie Notice</h3>
                <p className="text-xs text-muted-foreground">
                  This website uses local storage to save your preferences. 
                  All audio processing happens locally in your browser - we don&apos;t upload or store your audio files.
                  By using this site, you agree to our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleCookieConsent(false)}
                  className="text-xs px-3 py-1.5 border border-border rounded-md hover:bg-muted/50"
                >
                  Decline
                </button>
                <button 
                  onClick={() => handleCookieConsent(true)}
                  className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
