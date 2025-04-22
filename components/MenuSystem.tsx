import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cameraPresets } from '../utils/cameraEffects'
import * as THREE from 'three'
import { useStore } from '../store/visualizerStore'
import { WLEDService } from '../services/wledService'
import { EffectSettingsComponent } from './effectSettings/EffectSettings'
import { NumberInput } from './NumberInput'
import { getAllEffects } from './effects/effectRegistry'
import { EffectItem } from './effects/EffectItem'
import { CameraViewSection } from './camera/CameraViewSection'
import { getAllCameraPresets } from './camera/cameraRegistry'
import { BackgroundSection } from './BackgroundSection'
import { EffectsSection } from './menu/EffectsSection'
import { ColorSection } from './menu/ColorSection'
import { EffectSettingsSection } from './menu/EffectSettingsSection'

interface MenuSystemProps {
  activeEffects: string[]
  onEffectChange: (effects: string[]) => void
  currentColor: string
  onColorChange: (color: string) => void
  effectSettings: {
    bars: {
      heightMultiplier: number
      width: number
      depth: number
      spacing: number
      emissiveIntensity: number
      count: number
    }
    wave: {
      heightMultiplier: number
      spacing: number
      lineWidth: number
      opacity: number
    }
    particles: {
      count: number
      baseSize: number
      maxSize: number
      distributionRange: number
      emissiveIntensity: number
    }
    sphere: {
      radius: number
      segments: number
      displacementScale: number
      emissiveIntensity: number
    }
    stars: {
      count: number
      baseSize: number
      maxSize: number
      distributionRange: number
      emissiveIntensity: number
    }
    currentLyric: {
      fontSize: number
      depth: number
      spacing: number
      animationSpeed: number
      emissiveIntensity: number
    }
    test: {
      count: number
      size: number
      speed: number
      spread: number
    }
  }
  onEffectSettingsUpdate: (settings: any) => void
  onCameraChange: (preset: string) => void
  cameraEffect?: string
  onCameraEffectChange?: (effect: string | null) => void
}

interface UserGradient {
  id: string
  name: string
  stops: Array<{ color: string; position: number }>
}

const MenuSystem = ({ 
  activeEffects, 
  onEffectChange, 
  currentColor, 
  onColorChange,
  effectSettings,
  onEffectSettingsUpdate,
  onCameraChange,
  cameraEffect,
  onCameraEffectChange
}: MenuSystemProps) => {
  const { 
    wledEnabled, 
    wledDeviceIp, 
    setWledEnabled, 
    setWledDeviceIp, 
    initializeWled, 
    wledService,
    showFPS,
    setShowFPS
  } = useStore()
  
  const [recentColors, setRecentColors] = useState<string[]>([
    '#FFFFFF', // White
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080'  // Purple
  ])
  
  const [selectedEffect, setSelectedEffect] = useState<string>('bars')
  const [selectedCameraView, setSelectedCameraView] = useState<string>('Front')
  const [userGradients, setUserGradients] = useState<UserGradient[]>([])
  const [activeGradient, setActiveGradient] = useState<UserGradient | null>(null)
  const [gradientProgress, setGradientProgress] = useState(0)
  const [isMenuVisible, setIsMenuVisible] = useState(true)
  const [menuHeight, setMenuHeight] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleCameraViewChange = useCallback((view: string) => {
    setSelectedCameraView(view)
    onCameraChange(view)
  }, [onCameraChange])

  const handleSettingsUpdate = useCallback((newSettings: any) => {
    onEffectSettingsUpdate({
      ...effectSettings,
      [selectedEffect]: newSettings.settings
    })
  }, [effectSettings, selectedEffect, onEffectSettingsUpdate])

  useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(menuRef.current.scrollHeight)
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const keyNumber = parseInt(e.key)
      if (keyNumber >= 1 && keyNumber <= 10) {
        const colorIndex = keyNumber - 1
        if (recentColors[colorIndex]) {
          onColorChange(recentColors[colorIndex])
          
          if (wledEnabled && wledService) {
            console.log('[MenuSystem] Updating WLED with color:', recentColors[colorIndex])
            wledService.setColor(recentColors[colorIndex]).catch(error => {
              console.error('[MenuSystem] Error updating WLED:', error)
            })
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [recentColors, onColorChange, wledEnabled, wledService])

  return (
    <>
      <button
        onClick={() => setIsMenuVisible(!isMenuVisible)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          zIndex: 1001,
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          transition: 'transform 0.3s ease',
          transform: isMenuVisible ? 'rotate(0deg)' : 'rotate(180deg)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        ▼
      </button>

      <div 
        ref={menuRef}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '2rem',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '2rem',
          transition: 'all 0.3s ease',
          transform: isMenuVisible ? 'translateY(0)' : `translateY(${menuHeight}px)`,
          opacity: isMenuVisible ? 1 : 0,
          pointerEvents: isMenuVisible ? 'auto' : 'none'
        }}
      >
        <EffectsSection
          activeEffects={activeEffects}
          onEffectChange={onEffectChange}
          selectedEffect={selectedEffect}
          onEffectSelect={setSelectedEffect}
          currentColor={currentColor}
        />

        <ColorSection
          currentColor={currentColor}
          onColorChange={onColorChange}
          recentColors={recentColors}
          setRecentColors={setRecentColors}
          userGradients={userGradients}
          setUserGradients={setUserGradients}
          activeGradient={activeGradient}
          setActiveGradient={setActiveGradient}
          gradientProgress={gradientProgress}
          setGradientProgress={setGradientProgress}
          wledEnabled={wledEnabled}
          wledDeviceIp={wledDeviceIp}
        />

        <EffectSettingsSection
          selectedEffect={selectedEffect}
          effectSettings={effectSettings}
          onSettingsUpdate={handleSettingsUpdate}
        />

        <CameraViewSection
          selectedView={selectedCameraView}
          onViewChange={handleCameraViewChange}
          cameraEffect={cameraEffect}
          onCameraEffectChange={onCameraEffectChange}
          presets={getAllCameraPresets()}
        />

        <BackgroundSection />

        <div style={{ minWidth: '200px' }}>
          <h3 style={{ 
            color: 'white', 
            fontSize: '1rem',
            fontWeight: 500,
            marginBottom: '0.75rem',
            letterSpacing: '0.025em',
            textTransform: 'uppercase'
          }}>WLED INTEGRATION</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={wledEnabled}
                onChange={(e) => {
                  setWledEnabled(e.target.checked)
                  if (e.target.checked && wledDeviceIp) {
                    initializeWled()
                  }
                }}
                style={{ marginRight: '0.5rem' }}
              />
              <label style={{ color: 'white' }}>Enable WLED Sync</label>
            </div>
            <div>
              <label style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '0.75rem',
                display: 'block',
                marginBottom: '0.25rem'
              }}>WLED Device IP</label>
              <input
                type="text"
                value={wledDeviceIp}
                onChange={(e) => setWledDeviceIp(e.target.value)}
                placeholder="192.168.1.100"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={showFPS}
                onChange={(e) => setShowFPS(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label style={{ color: 'white' }}>Show FPS Counter</label>
            </div>
          </div>
        </div>

        <style jsx global>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 1rem;
            height: 1rem;
            background: white;
            border-radius: 50%;
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb {
            width: 1rem;
            height: 1rem;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            border: none;
          }

          input[type="range"]:focus {
            outline: none;
          }

          input[type="range"]:focus::-webkit-slider-thumb {
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
          }

          input[type="range"]:focus::-moz-range-thumb {
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </div>
    </>
  )
}

export default MenuSystem 