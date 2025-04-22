import { useState, useEffect } from 'react'
import * as THREE from 'three'

export const useColorTransition = (targetColor: string, duration: number = 500) => {
  const [currentColor, setCurrentColor] = useState<THREE.Color>(new THREE.Color(targetColor))

  useEffect(() => {
    const target = new THREE.Color(targetColor)
    const start = new THREE.Color(currentColor)
    
    let startTime = Date.now()
    let animationFrameId: number

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const newColor = new THREE.Color()
      newColor.r = start.r + (target.r - start.r) * progress
      newColor.g = start.g + (target.g - start.g) * progress
      newColor.b = start.b + (target.b - start.b) * progress
      
      setCurrentColor(newColor)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [targetColor, duration])

  return currentColor
} 