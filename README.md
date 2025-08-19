# DJ Visualizer Pro - Mixora

A comprehensive, professional-grade audio visualizer built with React, Next.js, and Three.js that creates stunning 3D visualizations from your system audio with real-time lyrics integration and smart lighting control.

## 🎵 Features


https://github.com/user-attachments/assets/d4c0491f-54a7-455d-aefb-a6a4f1b78366


### 🎨 Visualization Effects
- **Bars Effect** - Vertical frequency bars that respond to music
- **Wave Effect** - Dynamic waveform visualization
- **Particles Effect** - Interactive particle system
- **Sphere Effect** - 3D sphere with audio-reactive geometry
- **Stars Effect** - Stellar particle field
- **Current Lyric Effect** - Real-time synchronized lyrics display
- **Song Title Effect** - 3D animated song title display
- **Test Effect** - Development and testing visualization

### 🎥 Camera Controls
- **Multiple Preset Views**: Front, Back, Left, Right, Top, Side, Orbit
- **Interactive Controls**: Mouse/touch rotation and zoom
- **Auto-rotation**: Configurable orbital camera with damping
- **Smooth Transitions**: Animated camera movements between presets

### 🎭 Background System
- **HDRI Backgrounds**: High dynamic range image support
- **Color Backgrounds**: Customizable solid color backgrounds
- **Dynamic Switching**: Real-time background changes

### 🎤 Audio Integration
- **System Audio Capture**: Screen recording with audio
- **Real-time Analysis**: FFT-based frequency analysis
- **Multi-source Support**: Any audio source through screen sharing
- **Low Latency**: Optimized for live performance

### 🎼 Lyrics Integration
- **Spotify API**: Real-time track information and playback state
- **Genius API**: Lyrics search and retrieval
- **Musixmatch API**: Alternative lyrics provider
- **Synchronized Display**: Lyrics timing with audio
- **Multiple Providers**: Fallback system for lyrics availability

### 💡 Smart Lighting (WLED Integration)
- **WLED Device Control**: Direct control of WLED-compatible LED strips
- **Color Synchronization**: Visualizer colors sync with lighting
- **Network Control**: IP-based device management
- **Real-time Updates**: Instant color changes
- **Error Handling**: Robust connection management

### 🎛️ Advanced Controls
- **Effect Settings**: Detailed customization for each effect
- **Color Management**: Real-time color transitions
- **Performance Monitoring**: FPS display and optimization
- **Multi-effect Support**: Combine multiple effects simultaneously
- **Font Selection**: Custom typography for text effects

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with WebGL support
- WLED device (optional, for lighting control)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bryanCastle/DJ-Audio-Visualizer-Mixora-.git
   cd DJ-Audio-Visualizer-Mixora-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your API keys:
   ```env
   # Spotify API
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   
   # Genius API
   GENIUS_ACCESS_TOKEN=your_genius_access_token
   
   # Musixmatch API (optional)
   MUSIXMATCH_API_KEY=your_musixmatch_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Basic Visualization
1. Click "Start Visualization" to begin
2. Select your screen/window with audio
3. Choose your preferred visualization effect
4. Use mouse controls to rotate and zoom the 3D scene

### Advanced Features
- **Multiple Effects**: Enable multiple effects simultaneously
- **Camera Presets**: Switch between different viewing angles
- **Color Customization**: Use the color picker for custom themes
- **Background Selection**: Choose between HDRI and solid colors
- **WLED Control**: Enter your WLED device IP for synchronized lighting

### Lyrics Display
1. Connect your Spotify account for automatic track detection
2. Lyrics will automatically sync with your music
3. Manual search available through Genius API
4. Multiple lyrics providers ensure availability

##  Configuration

### Effect Settings
Each effect has customizable parameters:
- **Bars**: Height, width, spacing, color transitions
- **Wave**: Amplitude, frequency, wave type
- **Particles**: Count, size, speed, lifetime
- **Sphere**: Radius, segments, rotation speed
- **Stars**: Density, twinkle rate, color variation

### Camera Settings
- **Orbit Controls**: Auto-rotation, damping, distance limits
- **Transition Speed**: Smooth camera movements
- **Preset Management**: Save and load custom camera positions

### WLED Configuration
- **Device IP**: Network address of your WLED device
- **Color Sync**: Automatic synchronization with visualizer
- **Effect Mapping**: Map visualizer effects to LED patterns

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI framework
- **Next.js 14** - Full-stack framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### 3D Graphics
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers and abstractions
- **@react-three/postprocessing** - Post-processing effects

### Audio & Media
- **Web Audio API** - Audio analysis
- **Tone.js** - Audio processing
- **Screen Capture API** - System audio capture

### State Management
- **Zustand** - Lightweight state management
- **React Hooks** - Component state and effects

### APIs & Services
- **Spotify Web API** - Music playback and track info
- **Genius API** - Lyrics database
- **Musixmatch API** - Alternative lyrics provider
- **WLED API** - Smart lighting control

## 📁 Project Structure

```
DJVisualizerPro/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── effects/           # Visualization effects
│   ├── camera/            # Camera controls
│   ├── background/        # Background systems
│   ├── menu/              # UI menu components
│   └── effectSettings/    # Effect configuration
├── hooks/                 # Custom React hooks
├── services/              # API services
├── store/                 # State management
├── lyric-visualizer/      # Lyrics integration
├── pages/                 # Next.js pages
│   └── api/              # API routes
├── public/               # Static assets
├── styles/               # Global styles
└── utils/                # Utility functions
```

## 🔌 API Integrations

### Spotify Integration
- OAuth 2.0 authentication
- Real-time playback state
- Current track information
- Automatic track detection

### Genius API
- Lyrics search and retrieval
- Song metadata
- Artist information
- Fallback lyrics provider

### Musixmatch API
- Alternative lyrics source
- Song matching
- Translation support
- Backup lyrics provider

### WLED Integration
- REST API communication
- Real-time color control
- Device state management
- Network error handling

## 🎯 Performance Features

- **Optimized Rendering**: Efficient Three.js scene management
- **Audio Analysis**: Real-time FFT processing
- **Memory Management**: Proper cleanup and resource disposal
- **Network Optimization**: Debounced API requests
- **Error Recovery**: Robust error handling and retry logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community** - 3D graphics framework
- **Spotify** - Music API and integration
- **Genius** - Lyrics database
- **WLED Project** - Smart lighting control
- **React Three Fiber** - React integration for Three.js

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**DJ Visualizer Pro - Mixora** - Transform your music into stunning 3D visual experiences! 🎵✨ 
