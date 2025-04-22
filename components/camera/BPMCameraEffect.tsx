import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FrequencyRange {
  start: number
  end: number
  weight: number
  frequencyMultiplier: number
}

interface BPMCameraEffectProps {
  controlsRef: React.RefObject<any>
  bpm: number
  enabled: boolean
  dataArray: Uint8Array | null
  baseShake?: number
  frequencyRanges?: FrequencyRange[]
  randomFactorRange?: [number, number]
}

const DEFAULT_FREQUENCY_RANGES: FrequencyRange[] = [
  { start: 0, end: 20, weight: 0.6, frequencyMultiplier: 2 },  // Bass
  { start: 20, end: 40, weight: 0.3, frequencyMultiplier: 4 }, // Mid
  { start: 40, end: 60, weight: 0.1, frequencyMultiplier: 8 }  // High
]

export const BPMCameraEffect = ({ 
  controlsRef, 
  bpm, 
  enabled, 
  dataArray,
  baseShake = 0.07,
  frequencyRanges = DEFAULT_FREQUENCY_RANGES,
  randomFactorRange = [0.8, 1.2]
}: BPMCameraEffectProps) => {
  useFrame(({ clock }) => {
    if (
      enabled &&
      controlsRef.current &&
      controlsRef.current.object &&
      controlsRef.current.object.position &&
      dataArray
    ) {
      const camera = controlsRef.current.object
      
      // Calculate beat phase
      const beat = (clock.getElapsedTime() * bpm) / 60
      
      // Calculate shake for each frequency range
      const shakes = frequencyRanges.map(range => {
        const rangeData = dataArray.slice(range.start, range.end)
        const amplitude = rangeData.reduce((sum, value) => sum + value, 0) / rangeData.length
        const normalizedAmplitude = amplitude / 255
        
        return Math.sin(beat * Math.PI * range.frequencyMultiplier) * 
               baseShake * 
               normalizedAmplitude * 
               range.weight
      })
      
      // Combine all shakes
      const combinedShake = shakes.reduce((sum, shake) => sum + shake, 0)
      
      // Apply random factor
      const [min, max] = randomFactorRange
      const randomFactor = min + Math.random() * (max - min)
      const finalShake = combinedShake * randomFactor
      
      camera.position.x += finalShake
      camera.position.y += finalShake * 0.5
      controlsRef.current.update()
    }
  })
  return null
} 