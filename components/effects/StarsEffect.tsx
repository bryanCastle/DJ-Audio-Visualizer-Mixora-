import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface StarsEffectProps {
  settings: {
    count: number
    baseSize: number
    maxSize: number
    distributionRange: number
    emissiveIntensity: number
  }
  data: Uint8Array
  color: string
}

const StarsEffect = ({ settings, data, color }: StarsEffectProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Mesh[]>([])
  const timeRef = useRef(0)

  // Memoize the base geometry to avoid recreating it for each particle
  const baseGeometry = useMemo(() => {
    return new THREE.SphereGeometry(1, 6, 6) // Reduced segments for better performance
  }, [])

  // Memoize the material to avoid recreating it for each particle
  const baseMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: settings.emissiveIntensity,
      transparent: true,
      opacity: 0.8,
      shininess: 0, // Disable specular highlights for better performance
      depthWrite: false // Enable depth writing for better transparency handling
    })
  }, [color, settings.emissiveIntensity])

  useEffect(() => {
    if (!groupRef.current) return

    // Clear existing particles
    particlesRef.current.forEach(particle => {
      if (particle.parent) particle.parent.remove(particle)
    })
    particlesRef.current = []

    // Create new particles on the surface of a sphere
    for (let i = 0; i < settings.count; i++) {
      // Generate random spherical coordinates for surface points
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      // Convert spherical to cartesian coordinates
      const radius = settings.distributionRange * 3
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      // Clone the base geometry and material for better performance
      const geometry = baseGeometry.clone()
      const material = baseMaterial.clone()

      const particle = new THREE.Mesh(geometry, material)
      particle.position.set(x, y, z)
      particle.scale.set(settings.baseSize, settings.baseSize, settings.baseSize)
      
      // Store the original position and some pre-calculated values for animation
      particle.userData = {
        originalPosition: new THREE.Vector3(x, y, z),
        phaseOffset: Math.random() * Math.PI * 2,
        movementScale: 0.1 + Math.random() * 0.1 // Slightly randomize movement scale
      }
      
      groupRef.current.add(particle)
      particlesRef.current.push(particle)
    }

    return () => {
      particlesRef.current.forEach(particle => {
        if (particle.parent) particle.parent.remove(particle)
        // Dispose of geometries and materials
        particle.geometry.dispose()
        if (Array.isArray(particle.material)) {
          particle.material.forEach(m => m.dispose())
        } else {
          particle.material.dispose()
        }
      })
      particlesRef.current = []
    }
  }, [settings.count, settings.baseSize, settings.distributionRange, color, baseGeometry, baseMaterial])

  useFrame((state, delta) => {
    if (!groupRef.current || !data) return

    // Update time with delta time for smoother animation
    timeRef.current += delta

    // Calculate average amplitude from audio data (using a subset of the data for better performance)
    const sampleSize = Math.min(32, data.length)
    let sum = 0
    for (let i = 0; i < sampleSize; i++) {
      sum += data[Math.floor(i * data.length / sampleSize)]
    }
    const normalizedAmplitude = (sum / sampleSize) / 255

    // Update each particle's size and position based on audio
    particlesRef.current.forEach((particle, index) => {
      const { originalPosition, phaseOffset, movementScale } = particle.userData

      // Get frequency data for this particle's position (using a smaller subset)
      const frequencyIndex = Math.floor((index / settings.count) * sampleSize)
      const frequencyValue = data[Math.floor(frequencyIndex * data.length / sampleSize)] / 255

      // Calculate new size based on both average and frequency-specific amplitude
      const size = settings.baseSize + (settings.maxSize - settings.baseSize) * 
        (normalizedAmplitude * 0.7 + frequencyValue * 0.3)

      particle.scale.set(size, size, size)

      // Add subtle movement to the particles
      const time = timeRef.current
      const movement = movementScale * normalizedAmplitude
      
      // Optimized position calculation
      particle.position.x = originalPosition.x + Math.sin(time + phaseOffset) * movement
      particle.position.y = originalPosition.y + Math.cos(time + phaseOffset * 1.1) * movement
      particle.position.z = originalPosition.z + Math.sin(time + phaseOffset * 0.9) * movement
    })
  })

  return <group ref={groupRef} />
}

export default StarsEffect 