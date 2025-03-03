/**
 * Converts an AudioBuffer to a Blob with the specified format
 */
export async function audioBufferToBlob(
  audioBuffer: AudioBuffer,
  format: 'wav' | 'mp3' = 'wav'
): Promise<Blob> {
  // Create an offline audio context
  const offlineContext = new OfflineAudioContext({
    numberOfChannels: audioBuffer.numberOfChannels,
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
  });

  // Create a buffer source
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  // Render the audio
  const renderedBuffer = await offlineContext.startRendering();

  // Convert to WAV format
  if (format === 'wav') {
    return bufferToWav(renderedBuffer);
  } else {
    // For MP3, you would need a library like lamejs
    // This is a placeholder - MP3 encoding is more complex
    return bufferToWav(renderedBuffer);
  }
}

/**
 * Converts an AudioBuffer to a WAV Blob
 */
function bufferToWav(audioBuffer: AudioBuffer): Blob {
  const numOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChannels * 2;
  const sampleRate = audioBuffer.sampleRate;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // Write WAV header
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk1size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, numOfChannels, true); // num of channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * numOfChannels * 2, true); // byte rate
  view.setUint16(32, numOfChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true); // subchunk2size

  // Write audio data
  const channelData = [];
  for (let i = 0; i < numOfChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }

  // Find peak amplitude for normalization
  let peakAmplitude = 0;
  for (let channel = 0; channel < numOfChannels; channel++) {
    for (let i = 0; i < audioBuffer.length; i++) {
      const absValue = Math.abs(channelData[channel][i]);
      if (absValue > peakAmplitude) {
        peakAmplitude = absValue;
      }
    }
  }
  
  // Normalization factor (avoid clipping but maintain good volume)
  const normalizationFactor = peakAmplitude > 0.95 ? 0.95 / peakAmplitude : 1.0;

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      // Apply normalization and convert float32 to int16
      const normalizedSample = channelData[channel][i] * normalizationFactor;
      const sample = Math.max(-1, Math.min(1, normalizedSample));
      
      // Convert to 16-bit PCM with proper rounding
      const int16Sample = sample < 0 
        ? Math.max(-32768, Math.round(sample * 32768)) 
        : Math.min(32767, Math.round(sample * 32767));
        
      view.setInt16(offset, int16Sample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Helper function to write a string to a DataView
 */
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
} 