'use client';

import { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { 
  FastForward, 
  Volume2, 
  Music, 
  Waves, 
  Repeat, 
  Sparkles,
  Zap,
  Moon
} from 'lucide-react';

export interface AudioParams {
  speed: number;
  pitch: number;
  volume: number;
  reverb: number;
  echo: number;
}

interface AudioControlsProps {
  onParamsChange: (params: AudioParams) => void;
  disabled: boolean;
}

const DEFAULT_PARAMS: AudioParams = {
  speed: 1,
  pitch: 1,
  volume: 1,
  reverb: 0,
  echo: 0
};

// Preset configurations
const PRESETS = {
  slowedReverb: {
    name: "Slowed + Reverb",
    icon: <Moon size={18} />,
    params: {
      speed: 0.85,
      pitch: 0.9,
      volume: 1,
      reverb: 0.6,
      echo: 0.3
    }
  },
  speedUp: {
    name: "Sped Up",
    icon: <FastForward size={18} />,
    params: {
      speed: 1.25,
      pitch: 1.1,
      volume: 1,
      reverb: 0.1,
      echo: 0
    }
  },
  nightcore: {
    name: "Nightcore",
    icon: <Zap size={18} />,
    params: {
      speed: 1.3,
      pitch: 1.3,
      volume: 1,
      reverb: 0.2,
      echo: 0.1
    }
  }
};

export default function AudioControls({ onParamsChange, disabled }: AudioControlsProps) {
  const [params, setParams] = useState<AudioParams>(DEFAULT_PARAMS);
  const [activeTab, setActiveTab] = useState('basic');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleParamChange = (key: keyof AudioParams, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParamsChange(newParams);
    setActivePreset(null); // Clear active preset when manually changing params
  };

  const resetParams = () => {
    setParams(DEFAULT_PARAMS);
    onParamsChange(DEFAULT_PARAMS);
    setActivePreset(null);
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setParams(preset.params);
    onParamsChange(preset.params);
    setActivePreset(presetKey);
  };

  return (
    <div className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Enhanced Popular Effects Section */}
      <div className="popular-effects-container">
        <h3 className="popular-effects-title">
          <Sparkles className="text-primary" size={18} />
          <span>Popular Effects</span>
        </h3>
        <div className="popular-effects-grid">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key as keyof typeof PRESETS)}
              className={`effect-button ${
                activePreset === key
                  ? 'effect-button-active'
                  : 'effect-button-inactive'
              }`}
            >
              {preset.icon}
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <ToggleGroup.Root
          type="single"
          defaultValue="basic"
          value={activeTab}
          onValueChange={(value) => value && setActiveTab(value)}
          className="flex w-full rounded-md overflow-hidden border border-border/50 bg-card-bg/50"
        >
          <ToggleGroup.Item
            value="basic"
            className={`flex-1 py-2 px-3 text-xs font-medium text-center transition-all ${
              activeTab === 'basic' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/30'
            }`}
          >
            Basic
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="effects"
            className={`flex-1 py-2 px-3 text-xs font-medium text-center transition-all ${
              activeTab === 'effects' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/30'
            }`}
          >
            Effects
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      {activeTab === 'basic' && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm flex items-center gap-2">
                <FastForward size={16} className="text-primary" />
                <span>Speed</span>
              </label>
              <span className="text-xs terminal-text bg-card-bg/50 px-2 py-0.5 rounded-full">{params.speed.toFixed(2)}x</span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[params.speed]}
              onValueChange={([value]) => handleParamChange('speed', value)}
              min={0.25}
              max={3}
              step={0.05}
            >
              <Slider.Track className="ai-slider-track relative grow">
                <Slider.Range className="ai-slider-range" />
              </Slider.Track>
              <Slider.Thumb className="ai-slider-thumb" />
            </Slider.Root>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm flex items-center gap-2">
                <Music size={16} className="text-primary" />
                <span>Pitch</span>
              </label>
              <span className="text-xs terminal-text bg-card-bg/50 px-2 py-0.5 rounded-full">{params.pitch.toFixed(2)}x</span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[params.pitch]}
              onValueChange={([value]) => handleParamChange('pitch', value)}
              min={0.5}
              max={2}
              step={0.05}
            >
              <Slider.Track className="ai-slider-track relative grow">
                <Slider.Range className="ai-slider-range" />
              </Slider.Track>
              <Slider.Thumb className="ai-slider-thumb" />
            </Slider.Root>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm flex items-center gap-2">
                <Volume2 size={16} className="text-primary" />
                <span>Volume</span>
              </label>
              <span className="text-xs terminal-text bg-card-bg/50 px-2 py-0.5 rounded-full">{Math.round(params.volume * 100)}%</span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[params.volume]}
              onValueChange={([value]) => handleParamChange('volume', value)}
              min={0}
              max={2}
              step={0.05}
            >
              <Slider.Track className="ai-slider-track relative grow">
                <Slider.Range className="ai-slider-range" />
              </Slider.Track>
              <Slider.Thumb className="ai-slider-thumb" />
            </Slider.Root>
          </div>
        </>
      )}

      {activeTab === 'effects' && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm flex items-center gap-2">
                <Waves size={16} className="text-primary" />
                <span>Reverb</span>
              </label>
              <span className="text-xs terminal-text bg-card-bg/50 px-2 py-0.5 rounded-full">{Math.round(params.reverb * 100)}%</span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[params.reverb]}
              onValueChange={([value]) => handleParamChange('reverb', value)}
              min={0}
              max={1}
              step={0.01}
            >
              <Slider.Track className="ai-slider-track relative grow">
                <Slider.Range className="ai-slider-range" />
              </Slider.Track>
              <Slider.Thumb className="ai-slider-thumb" />
            </Slider.Root>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm flex items-center gap-2">
                <Repeat size={16} className="text-primary" />
                <span>Echo</span>
              </label>
              <span className="text-xs terminal-text bg-card-bg/50 px-2 py-0.5 rounded-full">{Math.round(params.echo * 100)}%</span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[params.echo]}
              onValueChange={([value]) => handleParamChange('echo', value)}
              min={0}
              max={1}
              step={0.01}
            >
              <Slider.Track className="ai-slider-track relative grow">
                <Slider.Range className="ai-slider-range" />
              </Slider.Track>
              <Slider.Thumb className="ai-slider-thumb" />
            </Slider.Root>
          </div>
        </>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={resetParams}
          className="ai-button"
        >
          Reset All
        </button>
      </div>
    </div>
  );
} 