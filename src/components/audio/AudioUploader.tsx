'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Music, Sparkles, Loader2, Info } from 'lucide-react';

interface AudioUploaderProps {
  onAudioUpload: (audioBuffer: AudioBuffer, fileName: string) => void;
}

export default function AudioUploader({ onAudioUpload }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isCompactMode = () => {
    if (!isClient) return false;
    const parent = fileInputRef.current?.closest('.max-h-24');
    return !!parent;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;
    
    // Check file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15MB limit');
      return;
    }
    
    // Check file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/aac'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|flac|m4a|aac)$/i)) {
      setError('Unsupported file format. Please upload MP3, WAV, OGG, FLAC, M4A, or AAC');
      return;
    }
    
    setFileName(file.name);
    setIsLoading(true);
    setError(null);
    
    try {
      // Use proper type for AudioContext
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      onAudioUpload(audioBuffer, file.name);
      audioContext.close();
    } catch (err) {
      console.error('Error decoding audio data:', err);
      setError('Failed to process audio file. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleClearFile = () => {
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePrivacyInfo = () => {
    setShowPrivacyInfo(!showPrivacyInfo);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-md transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        } ${isCompactMode() ? 'p-2' : 'p-6'}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Processing audio...</p>
              <p className="text-xs text-primary/80 italic">Your sound journey is about to begin ✨</p>
            </div>
          ) : (
            <>
              <div className={`mb-2 ${isCompactMode() ? 'hidden' : ''}`}>
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-primary ai-pulse" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                </div>
              </div>
              <div className={`mb-3 ${isCompactMode() ? 'hidden' : ''}`}>
                <h3 className="text-sm font-medium">Upload your audio file</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  MP3, WAV, FLAC, OGG, M4A, or AAC files up to 15MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="ai-button inline-flex items-center gap-1 text-xs"
                disabled={isLoading}
              >
                <Upload size={14} />
                {isCompactMode() ? 'Upload New' : 'Select File'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {fileName && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Music className="text-secondary" size={18} />
          <span className="terminal-text truncate max-w-[200px]">{fileName}</span>
          <button 
            onClick={handleClearFile}
            className="p-1 rounded-full hover:bg-muted/30 text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
      )}

      <div className="mt-4">
        <button 
          onClick={togglePrivacyInfo}
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info size={12} />
          <span>{showPrivacyInfo ? 'Hide privacy information' : 'Show privacy information'}</span>
        </button>
        
        {showPrivacyInfo && (
          <div className="mt-2 p-3 bg-card-bg/50 border border-border/50 rounded-md text-xs">
            <h4 className="font-medium mb-1">Privacy Information (GDPR Compliant)</h4>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>All audio processing happens directly in your browser.</li>
              <li>Your audio files are never uploaded to our servers.</li>
              <li>We do not collect or store any personal data from your audio files.</li>
              <li>No cookies are used for tracking or advertising purposes.</li>
              <li>You maintain full ownership and control of your content.</li>
              <li>This application complies with EU GDPR data protection standards.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 