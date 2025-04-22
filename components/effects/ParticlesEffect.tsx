import { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useColorTransition } from '../../hooks/useColorTransition'

interface ParticlesEffectProps {
  data: Uint8Array
  color: string
  settings: {
    count: number
    baseSize: number
  }
}

interface Particle {
  position: THREE.Vector3
  size: number
  value: number
}

const ParticlesEffect = ({ data, color, settings }: ParticlesEffectProps) => {
  const { count, baseSize } = settings
  const maxSize = 0.3
  const distributionRange = 10
  const emissiveIntensity = 0.5
  const currentColor = useColorTransition(color)

  const positions = useMemo(() => {
    const result: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      result.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * distributionRange,
          (Math.random() - 0.5) * distributionRange,
          (Math.random() - 0.5) * distributionRange
        )
      )
    }
    return result
  }, [count, distributionRange])

  const particles = useMemo(() => {
    const result: Particle[] = []
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
      const size = baseSize + value * maxSize
      
      result.push({
        position: positions[i],
        size: size,
        value: value
      })
    }
    return result
  }, [data, positions, baseSize, maxSize])

  const materialRef = useRef<THREE.PointsMaterial>(null)

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
      {particles.map((particle, index) => (
        <mesh
          key={index}
          position={[particle.position.x, particle.position.y, particle.position.z]}
          scale={[particle.size, particle.size, particle.size]}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={currentColor}
            emissive={currentColor}
            emissiveIntensity={emissiveIntensity + particle.value * 0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

export default ParticlesEffect 