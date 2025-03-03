'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioWaveformProps {
  audioBuffer: AudioBuffer | null;
  isModified?: boolean;
  onPlaybackPositionChange?: (position: number) => void;
  useSimpleLine?: boolean;
}

export default function AudioWaveform({ 
  audioBuffer, 
  onPlaybackPositionChange,
}: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const lastBufferRef = useRef<AudioBuffer | null>(null);
  const wavBlobRef = useRef<Blob | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the WAV conversion to prevent unnecessary recalculations
  const getWavBlob = useMemo(() => {
    if (!isClient || !audioBuffer || audioBuffer === lastBufferRef.current) {
      return wavBlobRef.current;
    }
    
    // Convert AudioBuffer to WAV format only when the buffer changes
    const wavBuffer = audioBufferToWav(audioBuffer);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    
    // Cache the result
    lastBufferRef.current = audioBuffer;
    wavBlobRef.current = blob;
    
    return blob;
  }, [audioBuffer, isClient]);

  // Function to update audio element with new buffer while preserving playback state
  const updateAudioElement = (newBlob: Blob) => {
    if (!audioRef.current) return;
    
    // Store current playback state
    const wasPlaying = !audioRef.current.paused;
    const currentPositionPercent = audioRef.current.duration > 0 
      ? audioRef.current.currentTime / audioRef.current.duration 
      : 0;
    
    // Create a new object URL
    const newSrc = URL.createObjectURL(newBlob);
    
    // Update the src attribute
    audioRef.current.src = newSrc;
    
    // When metadata is loaded, restore playback state
    const handleMetadataLoaded = () => {
      if (!audioRef.current) return;
      
      // Restore position
      if (currentPositionPercent > 0 && currentPositionPercent < 1) {
        audioRef.current.currentTime = currentPositionPercent * audioRef.current.duration;
      }
      
      // Resume playback if it was playing
      if (wasPlaying) {
        audioRef.current.play().catch(err => console.error('Error resuming playback:', err));
      }
      
      // Remove the event listener
      audioRef.current.removeEventListener('loadedmetadata', handleMetadataLoaded);
    };
    
    // Add event listener for metadata loaded
    audioRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);
  };

  // Create audio element and set up simple line visualization
  useEffect(() => {
    // Only run on client side
    if (!isClient || !containerRef.current || !audioBuffer || !getWavBlob) return;

    // If we already have an audio element, update it instead of recreating
    if (audioRef.current) {
      updateAudioElement(getWavBlob);
      return;
    }

    // Create new audio element if one doesn't exist
    const audio = new Audio();
    
    // Set up event listeners before setting src to ensure they catch all events
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    // Set src after adding event listeners
    audio.src = URL.createObjectURL(getWavBlob);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      updateProgressBar();
      
      if (onPlaybackPositionChange && audio.duration) {
        onPlaybackPositionChange(audio.currentTime / audio.duration);
      }
    });

    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      updateProgressBar();
    });

    // Add error handling for playback issues
    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      // Attempt to recover by recreating the audio element
      setTimeout(() => {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.play().catch(err => console.error('Error in recovery playback:', err));
        }
      }, 100);
    });

    // Set up click handler for seeking
    if (containerRef.current) {
      containerRef.current.addEventListener('click', handleSeek);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleSeek);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioBuffer, getWavBlob, onPlaybackPositionChange, isClient]);

  // Update progress bar based on current time
  const updateProgressBar = () => {
    if (!audioRef.current || !progressRef.current || !cursorRef.current) return;
    
    const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    progressRef.current.style.width = `${percent}%`;
    cursorRef.current.style.left = `${percent}%`;
  };

  // Handle seeking when clicking on the line
  const handleSeek = (e: MouseEvent) => {
    if (!containerRef.current || !audioRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    
    audioRef.current.currentTime = percent * audioRef.current.duration;
    updateProgressBar();
  };

  // Function to convert AudioBuffer to WAV format
  function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2 + 44;
    const sampleRate = buffer.sampleRate;
    
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
      channelData.push(buffer.getChannelData(i));
    }
    
    // Interleave channel data and convert to 16-bit PCM
    let dataIndex = 0;
    for (let i = 0; i < buffer.length; i++) {
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

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const restart = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // If not on client side yet, render a placeholder
  if (!isClient) {
    return (
      <div className="w-full h-[80px] rounded-lg bg-card-bg/50 border border-border/50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading audio player...</p>
      </div>
    );
  }

  if (!audioBuffer) {
    return (
      <div className="w-full h-[80px] rounded-lg bg-card-bg/50 border border-border/50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Upload an audio file to see visualization</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 simple-audio-line" ref={containerRef}>
        <div className="line-container">
          <div className="audio-line">
            <div className="audio-progress" ref={progressRef}></div>
            <div className="audio-cursor" ref={cursorRef}></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <button 
            onClick={restart}
            className="p-2 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
        
        <div className="text-sm text-muted-foreground bg-card-bg/50 px-3 py-1 rounded-full">
          <span className="terminal-text">{formatTime(currentTime)}</span>
          <span> / </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
} 