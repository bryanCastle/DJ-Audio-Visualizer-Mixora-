import { EffectDefinition } from './types'

const effectRegistry: Record<string, EffectDefinition> = {}

export const registerEffect = (effect: EffectDefinition) => {
  effectRegistry[effect.id] = effect
}

export const getEffect = (id: string): EffectDefinition | undefined => {
  return effectRegistry[id]
}

export const getAllEffects = (): EffectDefinition[] => {
  return Object.values(effectRegistry)
}

// Register default effects
registerEffect({
  id: 'bars',
  name: 'Bars',
  description: 'Vertical bars that respond to music',
  icon: '📊',
  category: 'visual'
})

registerEffect({
  id: 'wave',
  name: 'Wave',
  description: 'Waveform visualization',
  icon: '🌊',
  category: 'visual'
})

registerEffect({
  id: 'particles',
  name: 'Particles',
  description: 'Particle system visualization',
  icon: '✨',
  category: 'visual'
})

registerEffect({
  id: 'sphere',
  name: 'Sphere',
  description: 'Sphere visualization',
  icon: '🌐',
  category: 'visual'
})

registerEffect({
  id: 'stars',
  name: 'Stars',
  description: 'Star visualization',
  icon: '⭐',
  category: 'visual'
})

registerEffect({
  id: 'currentLyric',
  name: 'Current Lyric',
  description: 'Display current song lyrics',
  icon: '🎵',
  category: 'text'
})

registerEffect({
  id: 'titleSong',
  name: 'Song Title',
  description: '3D song title display',
  icon: '🎶',
  category: 'text'
})

registerEffect({
  id: 'test',
  name: 'Test',
  description: 'Test effect',
  icon: '🔧',
  category: 'visual'
}) 