import { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useColorTransition } from '../../hooks/useColorTransition'

interface WaveEffectProps {
  data: Uint8Array
  color: string
  settings: {
    heightMultiplier: number
    lineWidth: number
    spacing: number
    opacity: number
  }
}

const WaveEffect = ({ data, color, settings }: WaveEffectProps) => {
  const { heightMultiplier, spacing, lineWidth, opacity } = settings

  const points = useMemo(() => {
    const result: THREE.Vector3[] = []
    const step = 1 // Fixed step for consistent wave
    
    for (let i = 0; i < data.length; i += step) {
      // Get the average of nearby points for smoother wave
      let sum = 0
      let count = 0
      for (let j = -2; j <= 2; j++) {
        const index = i + j
        if (index >= 0 && index < data.length) {
          sum += data[index]
          count++
        }
      }
      const value = (sum / count) / 255
      
      result.push(
        new THREE.Vector3(
          (i - data.length / 2) * spacing,
          value * heightMultiplier,
          0
        )
      )
    }
    return result
  }, [data, heightMultiplier, spacing])

  const geometry = useMemo(() => {
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setFromPoints(points)
    return bufferGeometry
  }, [points])

  const materialRef = useRef<THREE.LineBasicMaterial>(null)
  const currentColor = useColorTransition(color)

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
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial
        ref={materialRef}
        color={currentColor}
        linewidth={lineWidth}
        transparent
        opacity={opacity}
      />
    </line>
  )
}

export default WaveEffect 