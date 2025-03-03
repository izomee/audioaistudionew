# AudioModifier

A sleek, modern web application for modifying audio files with real-time preview and download capabilities. Built with Next.js, TypeScript, Tailwind CSS, and the Web Audio API.

![AudioModifier Screenshot](screenshot.png)

## Features

- **Upload Audio Files**: Drag and drop or browse to upload audio files (MP3, WAV, OGG, FLAC)
- **Real-time Audio Modification**: Hear changes as you adjust parameters
- **Audio Visualization**: See waveforms of both original and modified audio
- **Multiple Audio Effects**:
  - Speed adjustment (0.25x to 3x)
  - Pitch shifting (0.5x to 2x)
  - Volume control
  - Reverb effect
  - Echo effect
  - Low-pass and high-pass filters
- **Download Modified Audio**: Save your modified audio in WAV or MP3 format
- **Dark Theme**: Sleek, coding-inspired dark interface

## Tech Stack

- **Next.js**: React framework for the frontend
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Tone.js**: Web Audio framework for audio processing
- **WaveSurfer.js**: Audio visualization
- **Radix UI**: Accessible UI components
- **Lucide React**: Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/audiomodifier.git
   cd audiomodifier
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Upload an audio file** by dragging and dropping it onto the upload area or clicking to browse.
2. **Adjust audio parameters** using the sliders in the Audio Controls section.
3. **Preview the changes** in real-time by playing the audio.
4. **Toggle between original and modified** audio to compare them.
5. **Download the modified audio** in your preferred format.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Tone.js](https://tonejs.github.io/) for audio processing
- [WaveSurfer.js](https://wavesurfer-js.org/) for audio visualization
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Lucide React](https://lucide.dev/) for beautiful icons
