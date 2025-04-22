import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useColorTransition } from '../../hooks/useColorTransition'

interface BarsEffectProps {
  data: Uint8Array
  color: string
  settings: {
    heightMultiplier: number
    count: number
    width: number
    depth: number
    spacing: number
    emissiveIntensity: number
  }
}

interface Bar {
  value: number
  position: [number, number, number]
}

const BarsEffect = ({ data, color, settings }: BarsEffectProps) => {
  const { heightMultiplier, count, width, depth, spacing, emissiveIntensity } = settings
  const currentColor = useColorTransition(color)
  const materialRef = useRef<THREE.MeshPhongMaterial>(null)

  const bars = useMemo(() => {
    const result: Bar[] = []
    const step = Math.floor(data.length / count)
    
    for (let i = 0; i < count; i++) {
      // Get the average of nearby frequencies for smoother transitions
      let sum = 0
      let freqCount = 0
      for (let j = -2; j <= 2; j++) {
        const index = i * step + j
        if (index >= 0 && index < data.length) {
          sum += data[index]
          freqCount++
        }
      }
      const value = (sum / freqCount) / 255
      
      result.push({
        value,
        position: [
          (i - count / 2) * (width + spacing),
          value * heightMultiplier / 2,
          0
        ] as [number, number, number]
      })
    }
    return result
  }, [data, count, width, spacing, heightMultiplier])

  useEffect(() => {
    if (materialRef.current) {
      const targetColor = new THREE.Color(color)
      const startColor = new THREE.Color(materialRef.current.color)
      
      let startTime = Date.now()
      const duration = 500 // 500ms transition

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        const currentColor = new THREE.Color()
        currentColor.r = startColor.r + (targetColor.r - startColor.r) * progress
        currentColor.g = startColor.g + (targetColor.g - startColor.g) * progress
        currentColor.b = startColor.b + (targetColor.b - startColor.b) * progress
        
        if (materialRef.current) {
          materialRef.current.color = currentColor
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    }
  }, [color])

  return (
    <group>
      {bars.map((bar, i) => (
        <mesh
          key={i}
          position={bar.position}
        >
          <boxGeometry args={[width, bar.value * heightMultiplier, depth]} />
          <meshPhongMaterial
            ref={materialRef}
            color={currentColor}
            emissive={currentColor}
            emissiveIntensity={emissiveIntensity + bar.value * 0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

export default BarsEffect 