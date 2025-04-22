import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import Head from 'next/head'
import { useStore } from '../store/visualizerStore'
import BarsEffect from '../components/effects/BarsEffect'
import WaveEffect from '../components/effects/WaveEffect'
import ParticlesEffect from '../components/effects/ParticlesEffect'
import SphereEffect from '../components/effects/SphereEffect'
import StarsEffect from '../components/effects/StarsEffect'
import TestEffect from '../components/effects/TestEffect'
import CurrentLyricEffect from '../components/effects/CurrentLyricEffect'
import MenuSystem from '../components/MenuSystem'
import TitleSong from '../components/effects/TitleSong'
import { SpotifyService } from '../lyric-visualizer/services/spotifyService'
import { config } from '../lyric-visualizer/config'
import { BPMCameraEffect } from '../components/camera/BPMCameraEffect'
import { useAudioAnalysis } from '../hooks/useAudioAnalysis'
import { useCameraTransition } from '../hooks/useCameraTransition'
import HDRIBackground from '../components/background/HDRIBackground'

// =============================================
// COMPONENT: StaticLighting
// =============================================
// A static lighting setup that provides consistent illumination
// without the performance cost of camera-bound lighting
function StaticLighting() {
  return (
    <>
      <pointLight
        position={[5, 5, 5]}
        intensity={1.5}
        distance={100}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.005}
      />
      <pointLight
        position={[-5, -5, -5]}
        intensity={0.5}
        distance={100}
        color="#ffffff"
      />
    </>
  )
}

// =============================================
// CONSTANTS
// =============================================
// Default BPM value for camera effects
// Other global constants used throughout the component

const DEFAULT_BPM = 120

// =============================================
// MAIN VISUALIZER COMPONENT
// =============================================
// Core component that handles the entire visualization experience
// Manages state, effects, and user interactions

function OrbitAnimation({ controlsRef, selectedView }: { controlsRef: React.RefObject<any>, selectedView: string }) {
  const orbitRef = useRef<{ direction: number }>({ direction: 1 })

  useFrame((state) => {
    if (selectedView === 'Orbit' && controlsRef.current) {
      const controls = controlsRef.current
      const currentAzimuth = controls.getAzimuthalAngle()
      const targetAzimuth = currentAzimuth + (orbitRef.current.direction * 0.01)

      // Check if we've hit the limits
      if (targetAzimuth >= Math.PI * (70/180)) {
        orbitRef.current.direction = -1
      } else if (targetAzimuth <= -Math.PI * (70/180)) {
        orbitRef.current.direction = 1
      }

      // Apply the rotation
      controls.setAzimuthalAngle(currentAzimuth + (orbitRef.current.direction * 0.01))
    }
  })

  return null
}

function FPSDisplay() {
  const { showFPS } = useStore()
  const [fps, setFps] = useState(0)
  const lastTime = useRef(performance.now())
  const frames = useRef(0)

  useFrame(() => {
    if (showFPS) {
      frames.current++
      const now = performance.now()
      if (now - lastTime.current >= 1000) {
        setFps(Math.round((frames.current * 1000) / (now - lastTime.current)))
        frames.current = 0
        lastTime.current = now
      }
    }
  })

  if (!showFPS) return null

  return (
    <Html
      position={[5, 3, 0]}
      style={{
        position: 'absolute',
        pointerEvents: 'none'
      }}
    >
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000
      }}>
        {fps} FPS
      </div>
    </Html>
  )
}

const Visualizer = () => {
  // =============================================
  // REFS AND HOOKS
  // =============================================
  // Refs for DOM elements and Three.js objects
  const controlsRef = useRef<any>(null)
  const animationFrameRef = useRef<number>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spotifyServiceRef = useRef<SpotifyService>(
    new SpotifyService(config.spotify.clientId, config.spotify.redirectUri)
  )

  // =============================================
  // Custom hooks
  const { 
    audioContext,
    analyser,
    dataArray,
    isPlaying,
    error: audioError,
    showVisualizer,
    startAnalysis
  } = useAudioAnalysis()

  const { 
    isTransitioning,
    selectedView,
    handleCameraChange
  } = useCameraTransition(controlsRef)

  const { color, effect, background, showFPS } = useStore()
  const [activeEffects, setActiveEffects] = useState<string[]>(['bars', 'titleSong'])
  const [currentColor, setCurrentColor] = useState('#ff0000')
  const [visualizationData, setVisualizationData] = useState<number[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<{ title: string; artist: string } | null>(null)
  const [spotifyError, setSpotifyError] = useState<string | null>(null)
  const [cameraEffect, setCameraEffect] = useState<string | null>(null)
  const [bpm, setBpm] = useState<number>(DEFAULT_BPM)
  const [effectSettings, setEffectSettings] = useState({
    bars: { 
      heightMultiplier: 1, 
      count: 32,
      width: 0.2,
      depth: 0.2,
      spacing: 0.4,
      emissiveIntensity: 0.5
    },
    wave: { 
      heightMultiplier: 1, 
      lineWidth: 2,
      spacing: 0.2,
      opacity: 0.8
    },
    particles: { 
      count: 100, 
      baseSize: 0.1,
      maxSize: 0.3,
      distributionRange: 10,
      emissiveIntensity: 0.5
    },
    sphere: { 
      radius: 2, 
      segments: 32,
      displacementScale: 0.5,
      emissiveIntensity: 0.5
    },
    stars: { 
      count: 100, 
      baseSize: 0.1,
      maxSize: 0.3,
      distributionRange: 5,
      emissiveIntensity: 0.5
    },
    test: {
      count: 1000,
      size: 0.1,
      speed: 0.1,
      spread: 10
    },
    currentLyric: {
      fontSize: 24,
      depth: 0.1,
      spacing: 0.2,
      animationSpeed: 1,
      emissiveIntensity: 0.5
    },
    titleSong: {
      size: 2.0,
      height: 0.5,
      position: [0, 0, -2] as [number, number, number],
      scale: [2, 2, 2] as [number, number, number]
    }
  })

  // =============================================
  // SPOTIFY INTEGRATION
  // =============================================
  // Authentication flow
  useEffect(() => {
    const initSpotify = async () => {
      try {
        const storedToken = localStorage.getItem('spotify_access_token');
        if (!storedToken) {
          // If no token exists, redirect to Spotify login
          const spotifyService = new SpotifyService(
            config.spotify.clientId,
            config.spotify.redirectUri
          );
          await spotifyService.initialize();
        } else {
          // If token exists, we're authenticated
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing Spotify:', error);
        setSpotifyError('Failed to authenticate with Spotify. Please try again.');
      }
    };

    initSpotify();
  }, []);

  // =============================================
  // VISUALIZATION EFFECTS
  // =============================================
  // Effect rendering logic
  // Effect settings management
  // Dynamic effect updates based on audio data

  // Generate initial visualization data
  useEffect(() => {
    console.log('Setting initial visualization data')
    const initialData = Array.from({ length: 128 }, (_, i) => {
      return 0.5 + Math.sin(i * 0.1) * 0.3
    })
    setVisualizationData(initialData)
  }, [])

  // Update current track
  useEffect(() => {
    const updateTrack = async () => {
      // Only fetch track if titleSong or currentLyric effects are active
      if (!activeEffects.includes('titleSong') && !activeEffects.includes('currentLyric')) {
        return;
      }

      try {
        const track = await spotifyServiceRef.current.getCurrentTrack();
        if (track && (!currentTrack || 
            track.title !== currentTrack.title || 
            track.artist !== currentTrack.artist)) {
          setCurrentTrack({ title: track.title, artist: track.artist });
        }
      } catch (error) {
        console.error('Error fetching current track:', error);
      }
    };

    const interval = setInterval(updateTrack, 1000);
    return () => clearInterval(interval);
  }, [currentTrack, activeEffects]);

  const renderEffect = () => {
    if (!dataArray) return null

    return (
      <>
        {activeEffects.includes('bars') && (
          <BarsEffect data={dataArray} color={currentColor} settings={effectSettings.bars} />
        )}
        {activeEffects.includes('wave') && (
          <WaveEffect data={dataArray} color={currentColor} settings={effectSettings.wave} />
        )}
        {activeEffects.includes('particles') && (
          <ParticlesEffect data={dataArray} color={currentColor} settings={effectSettings.particles} />
        )}
        {activeEffects.includes('sphere') && (
          <SphereEffect data={dataArray} color={currentColor} settings={effectSettings.sphere} />
        )}
        {activeEffects.includes('stars') && (
          <StarsEffect data={dataArray} color={currentColor} settings={effectSettings.stars} />
        )}
        {activeEffects.includes('test') && (
          <TestEffect data={dataArray} color={currentColor} settings={effectSettings.test} />
        )}
        {activeEffects.includes('currentLyric') && (
          <CurrentLyricEffect data={dataArray} color={currentColor} settings={effectSettings.currentLyric} />
        )}
        <TitleSong 
          data={dataArray} 
          color={currentColor} 
          title={currentTrack?.title || 'No track playing'}
          isActive={activeEffects.includes('titleSong')}
          settings={effectSettings.titleSong}
        />
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Authenticating with Spotify...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!showVisualizer) {
    return (
      <>
        <Head>
          <title>DJ Visualizer Pro</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundSize: '100% 100%',
            backgroundPosition: '0px 0px,0px 0px,0px 0px,0px 0px,0px 0px',
            backgroundImage: 'radial-gradient(49% 81% at 45% 47%, #FFE20345 0%, #073AFF00 100%),radial-gradient(113% 91% at 17% -2%, #FF5A00FF 1%, #FF000000 99%),radial-gradient(142% 91% at 83% 7%, #FFDB00FF 1%, #FF000000 99%),radial-gradient(142% 91% at -6% 74%, #FF0049FF 1%, #FF000000 99%),radial-gradient(142% 91% at 111% 84%, #FF7000FF 0%, #FF0000FF 100%)',
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white'
            }}
          >
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 800,
              marginBottom: '1.5rem',
              textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeInUp 1s ease-out forwards'
            }}>
              <span style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                animation: 'fadeInUp 1s ease-out 0.2s forwards',
                opacity: 0
              }}>
                welcome to
              </span>
              <span style={{
                fontSize: 'clamp(6rem, 20vw, 15rem)',
                lineHeight: 1,
                marginTop: '-1rem',
                animation: 'fadeInUp 1s ease-out 0.4s forwards',
                opacity: 0
              }}>
                mixora.
              </span>
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              marginBottom: '3rem',
              maxWidth: '600px',
              padding: '0 1rem',
              textAlign: 'center',
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '100%',
              animation: 'fadeInUp 1s ease-out 0.6s forwards',
              opacity: 0
            }}>
              You&apos;re authenticated with Spotify! <br/>
              Click below to start the visualization.
            </p>
            <button
              onClick={startAnalysis}
              style={{
                padding: '1rem 2.5rem',
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                fontWeight: 600,
                borderRadius: '1rem',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: 'fadeInUp 1s ease-out 0.8s forwards, pulse 2s infinite',
                opacity: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Start Visualization
            </button>
          </div>
          
          <div
            style={{
              position: 'absolute',
              bottom: '2rem',
              right: '2rem',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              animation: 'fadeIn 2s ease-out 1.5s forwards',
              opacity: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Created by</span>
            <span style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500
            }}>Bryan Castillo</span>
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
            }
            70% {
              transform: scale(1.05);
              box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </>
    )
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 75 }}>
        {background.type === 'hdri' && background.path && (
          <HDRIBackground 
            hdriPath={background.path}
            intensity={1}
            rotation={0}
          />
        )}
        <color attach="background" args={[background.color]} />
        <ambientLight intensity={0.5} />
        <StaticLighting />
        <spotLight position={[0, 10, 0]} angle={0.15} penumbra={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <OrbitControls 
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={2}
          maxDistance={10}
          enabled={!isTransitioning}
          autoRotate={false}
          minAzimuthAngle={selectedView === 'Orbit' ? -Math.PI * (70/180) : -Infinity}
          maxAzimuthAngle={selectedView === 'Orbit' ? Math.PI * (70/180) : Infinity}
        />
        <OrbitAnimation controlsRef={controlsRef} selectedView={selectedView} />
        <BPMCameraEffect 
          controlsRef={controlsRef} 
          bpm={bpm} 
          enabled={cameraEffect === 'bpm'} 
          dataArray={dataArray} 
        />
        <FPSDisplay />
        {renderEffect()}
      </Canvas>
      <MenuSystem
        activeEffects={activeEffects}
        onEffectChange={setActiveEffects}
        currentColor={currentColor}
        onColorChange={setCurrentColor}
        effectSettings={effectSettings}
        onEffectSettingsUpdate={setEffectSettings}
        onCameraChange={handleCameraChange}
        cameraEffect={cameraEffect || ''}
        onCameraEffectChange={setCameraEffect}
      />
      {(audioError || spotifyError) && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          backgroundColor: 'rgba(255, 0, 0, 0.7)',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          zIndex: 1000
        }}>
          {audioError || spotifyError}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return <Visualizer />
} 