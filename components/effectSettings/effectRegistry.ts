import { BarsSettings } from './BarsSettings'
import { WaveSettings } from './WaveSettings'
import { ParticlesSettings } from './ParticlesSettings'
import { SphereSettings } from './SphereSettings'
import { StarsSettings } from './StarsSettings'
import { CurrentLyricSettings } from './CurrentLyricSettings'
import { TitleSongSettings } from './TitleSongSettings'
import { TestSettings } from './TestSettings'
import { EffectSettingsProps } from './types'

type EffectSettingsComponent = React.FC<EffectSettingsProps>

interface EffectRegistry {
  [key: string]: {
    component: EffectSettingsComponent
    defaultSettings: Record<string, any>
  }
}

export const effectRegistry: EffectRegistry = {
  bars: {
    component: BarsSettings,
    defaultSettings: {
      heightMultiplier: 1,
      count: 32,
      width: 0.5,
      depth: 0.5,
      spacing: 0.5,
      emissiveIntensity: 1
    }
  },
  wave: {
    component: WaveSettings,
    defaultSettings: {
      heightMultiplier: 1,
      spacing: 1,
      lineWidth: 0.1,
      opacity: 0.8
    }
  },
  particles: {
    component: ParticlesSettings,
    defaultSettings: {
      count: 100,
      baseSize: 0.1,
      maxSize: 0.3,
      distributionRange: 5,
      emissiveIntensity: 1
    }
  },
  sphere: {
    component: SphereSettings,
    defaultSettings: {
      radius: 1,
      segments: 32,
      displacementScale: 0.5,
      emissiveIntensity: 1
    }
  },
  stars: {
    component: StarsSettings,
    defaultSettings: {
      count: 100,
      baseSize: 0.1,
      maxSize: 0.3,
      distributionRange: 5,
      emissiveIntensity: 0.5
    }
  },
  currentLyric: {
    component: CurrentLyricSettings,
    defaultSettings: {
      fontSize: 50,
      depth: 0.1,
      spacing: 0.1,
      animationSpeed: 1,
      emissiveIntensity: 1,
      fontFamily: 'helvetiker_regular'
    }
  },
  titleSong: {
    component: TitleSongSettings,
    defaultSettings: {
      size: 2.0,
      height: 0.5,
      position: [0, 0, -2],
      scale: [2, 2, 2],
      fontFamily: 'Jacquard 12_Regular'
    }
  },
  test: {
    component: TestSettings,
    defaultSettings: {
      count: 100,
      size: 0.1,
      speed: 0.1,
      spread: 10
    }
  }
}

export const getEffectComponent = (effectName: string): EffectSettingsComponent | null => {
  return effectRegistry[effectName]?.component || null
}

export const getDefaultSettings = (effectName: string): Record<string, any> => {
  return effectRegistry[effectName]?.defaultSettings || {}
} 