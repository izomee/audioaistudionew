import * as Tone from 'tone';
import { AudioParams } from '@/components/audio/AudioControls';

export class AudioProcessor {
  private originalBuffer: AudioBuffer;
  private modifiedBuffer: AudioBuffer | null = null;
  private player: Tone.Player | null = null;
  private pitchShift: Tone.PitchShift | null = null;
  private reverb: Tone.Reverb | null = null;
  private feedbackDelay: Tone.FeedbackDelay | null = null;
  private volume: Tone.Volume | null = null;
  private isProcessing = false;
  private lastProcessedParams: AudioParams | null = null;
  private audioContext: AudioContext | null = null;

  constructor(audioBuffer: AudioBuffer) {
    this.originalBuffer = audioBuffer;
    // Use the existing AudioContext if possible to avoid creating multiple contexts
    try {
      const AudioContextClass = window.AudioContext || 
                               ((window as unknown) as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      Tone.setContext(this.audioContext);
    } catch (error) {
      console.error('Error creating AudioContext:', error);
    }
  }

  async setupEffectChain() {
    // Clean up previous instances
    this.disposeEffects();

    // Create new effects chain
    this.player = new Tone.Player().toDestination();
    this.pitchShift = new Tone.PitchShift();
    this.reverb = new Tone.Reverb();
    this.feedbackDelay = new Tone.FeedbackDelay();
    this.volume = new Tone.Volume();

    // Connect effects chain
    this.player.chain(
      this.pitchShift,
      this.reverb,
      this.feedbackDelay,
      this.volume,
      Tone.getDestination()
    );

    // Set default values
    this.pitchShift.pitch = 0;
    this.reverb.decay = 1.5;
    this.reverb.wet.value = 0;
    this.feedbackDelay.delayTime.value = 0.25;
    this.feedbackDelay.feedback.value = 0;
    this.feedbackDelay.wet.value = 0;
    this.volume.volume.value = 0;

    // Load buffer
    this.player.buffer = this.convertAudioBufferToToneBuffer(this.originalBuffer);
  }

  private convertAudioBufferToToneBuffer(audioBuffer: AudioBuffer): Tone.ToneAudioBuffer {
    return new Tone.ToneAudioBuffer(audioBuffer);
  }

  applyParams(params: AudioParams) {
    if (!this.player || !this.pitchShift || !this.reverb || !this.feedbackDelay || !this.volume) {
      return;
    }

    // Apply speed (playback rate)
    this.player.playbackRate = params.speed;
    
    // Apply pitch shift (semitones)
    // Convert pitch multiplier to semitones
    const semitones = Math.log2(params.pitch) * 12;
    this.pitchShift.pitch = semitones;
    
    // Apply volume
    this.volume.volume.value = Tone.gainToDb(params.volume);
    
    // Apply reverb
    this.reverb.wet.value = params.reverb;
    
    // Apply echo (feedback delay)
    this.feedbackDelay.feedback.value = params.echo * 0.6; // Scale to reasonable feedback value
    this.feedbackDelay.wet.value = params.echo;
  }

  async processAudio(params: AudioParams): Promise<AudioBuffer> {
    if (this.isProcessing) {
      throw new Error('Already processing audio');
    }

    // Skip processing if we already have a modified buffer with the same params
    // This is a simple optimization to avoid redundant processing
    if (this.modifiedBuffer && 
        this.lastProcessedParams &&
        this.areParamsEqual(params, this.lastProcessedParams)) {
      return this.modifiedBuffer;
    }

    this.isProcessing = true;
    this.lastProcessedParams = { ...params };
    
    // Store playback state before processing
    const wasPlaying = this.player && this.player.state === 'started';
    let playbackPosition = 0;
    
    if (this.player && this.player.buffer) {
      // Get current playback position using Tone.Transport.seconds
      // This is a more reliable way to get the current playback time
      const currentTime = Tone.Transport.seconds;
      
      // Calculate position as a percentage of total duration
      const duration = this.player.buffer.duration;
      if (duration > 0) {
        // Use a simple approach that works with Tone.js Player
        // We'll estimate the position based on the current transport time
        playbackPosition = (currentTime % duration) / duration;
        if (playbackPosition > 1 || playbackPosition < 0) {
          playbackPosition = 0; // Reset if beyond duration or negative
        }
      }
    }

    try {
      // Create an offline context for rendering
      // Calculate buffer length based on speed to avoid unnecessary allocation
      const newLength = Math.ceil(this.originalBuffer.length / params.speed);
      
      const offlineContext = new OfflineAudioContext({
        numberOfChannels: this.originalBuffer.numberOfChannels,
        length: newLength,
        sampleRate: this.originalBuffer.sampleRate
      });

      // Create source and connect it to the destination
      const source = offlineContext.createBufferSource();
      source.buffer = this.originalBuffer;
      source.playbackRate.value = params.speed;

      // Create Web Audio API native nodes
      
      // Create a gain node for volume
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = params.volume;
      
      // Apply pitch shifting using detune
      if (params.pitch !== 1) {
        // Convert pitch ratio to cents (100 cents = 1 semitone)
        const cents = Math.log2(params.pitch) * 1200;
        source.detune.value = cents;
      }
      
      // Create a convolver for reverb if needed
      let convolverNode = null;
      if (params.reverb > 0) {
        convolverNode = offlineContext.createConvolver();
        // Create a simple impulse response for reverb
        const impulseLength = Math.min(offlineContext.sampleRate * 2, 44100); // 2 seconds, but cap at 44100 for performance
        const impulse = offlineContext.createBuffer(
          2, 
          impulseLength, 
          offlineContext.sampleRate
        );
        
        // Fill the impulse response buffer with optimized calculation
        const decay = 0.3; // Decay factor
        for (let channel = 0; channel < 2; channel++) {
          const impulseData = impulse.getChannelData(channel);
          for (let i = 0; i < impulseLength; i++) {
            // Use a more efficient calculation for the exponential decay
            impulseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (impulseLength * decay));
          }
        }
        
        convolverNode.buffer = impulse;
      }
      
      // Create delay node for echo
      let delayNode = null;
      let feedbackGain = null;
      if (params.echo > 0) {
        delayNode = offlineContext.createDelay();
        delayNode.delayTime.value = 0.25; // 250ms delay
        
        feedbackGain = offlineContext.createGain();
        feedbackGain.gain.value = params.echo * 0.6; // Feedback amount
      }
      
      // Connect the nodes - simplified connection chain to avoid audio artifacts
      source.connect(gainNode);
      
      let lastNode = gainNode;
      
      if (convolverNode && params.reverb > 0) {
        // Create a dry/wet mix for reverb
        const dryGain = offlineContext.createGain();
        const wetGain = offlineContext.createGain();
        
        lastNode.connect(dryGain);
        lastNode.connect(convolverNode);
        convolverNode.connect(wetGain);
        
        dryGain.gain.value = 1 - params.reverb;
        wetGain.gain.value = params.reverb;
        
        const reverbMixNode = offlineContext.createGain();
        dryGain.connect(reverbMixNode);
        wetGain.connect(reverbMixNode);
        
        lastNode = reverbMixNode;
      }
      
      if (delayNode && feedbackGain && params.echo > 0) {
        // Create a dry/wet mix for delay
        const dryGain = offlineContext.createGain();
        const wetGain = offlineContext.createGain();
        
        lastNode.connect(dryGain);
        lastNode.connect(delayNode);
        delayNode.connect(wetGain);
        
        // Create feedback loop for delay
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        
        dryGain.gain.value = 1 - params.echo;
        wetGain.gain.value = params.echo;
        
        const delayMixNode = offlineContext.createGain();
        dryGain.connect(delayMixNode);
        wetGain.connect(delayMixNode);
        
        lastNode = delayMixNode;
      }
      
      lastNode.connect(offlineContext.destination);

      // Start the source
      source.start(0);

      // Render the audio
      const renderedBuffer = await offlineContext.startRendering();
      this.modifiedBuffer = renderedBuffer;
      
      // Update the player buffer with the new modified buffer
      if (this.player) {
        this.player.buffer = this.convertAudioBufferToToneBuffer(renderedBuffer);
        
        // If it was playing before, resume playback at the same relative position
        if (wasPlaying) {
          // Small delay to ensure buffer is loaded
          setTimeout(() => {
            if (playbackPosition > 0 && playbackPosition < 1) {
              this.seek(playbackPosition);
            }
            this.play();
          }, 50);
        }
      }
      
      return renderedBuffer;
    } catch (error) {
      console.error('Error processing audio:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Helper method to compare audio params for equality
  private areParamsEqual(params1: AudioParams, params2: AudioParams): boolean {
    return (
      Math.abs(params1.speed - params2.speed) < 0.001 &&
      Math.abs(params1.pitch - params2.pitch) < 0.001 &&
      Math.abs(params1.volume - params2.volume) < 0.001 &&
      Math.abs(params1.reverb - params2.reverb) < 0.001 &&
      Math.abs(params1.echo - params2.echo) < 0.001
    );
  }

  play() {
    if (!this.player) return;
    
    if (this.player.state === 'started') {
      this.player.stop();
    }
    
    try {
      this.player.start();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  stop() {
    if (!this.player) return;
    try {
      this.player.stop();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  seek(position: number) {
    if (!this.player) return;
    try {
      const duration = this.player.buffer.duration;
      this.player.start(undefined, duration * position);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }

  getModifiedBuffer(): AudioBuffer | null {
    return this.modifiedBuffer;
  }

  getOriginalBuffer(): AudioBuffer {
    return this.originalBuffer;
  }

  disposeEffects() {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
    if (this.pitchShift) {
      this.pitchShift.dispose();
      this.pitchShift = null;
    }
    if (this.reverb) {
      this.reverb.dispose();
      this.reverb = null;
    }
    if (this.feedbackDelay) {
      this.feedbackDelay.dispose();
      this.feedbackDelay = null;
    }
    if (this.volume) {
      this.volume.dispose();
      this.volume = null;
    }
  }

  dispose() {
    this.disposeEffects();
    
    // Clear references to buffers to help garbage collection
    this.modifiedBuffer = null;
    
    // Close audio context if it exists
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(err => console.error('Error closing AudioContext:', err));
    }
  }
} 