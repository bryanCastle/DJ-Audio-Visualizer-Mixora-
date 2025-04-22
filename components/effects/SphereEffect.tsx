import { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useColorTransition } from '../../hooks/useColorTransition'

interface SphereEffectProps {
  data: Uint8Array
  color: string
  settings: {
    radius: number
    segments: number
  }
}

const SphereEffect = ({ data, color, settings }: SphereEffectProps) => {
  const { radius, segments } = settings
  const displacementScale = 0.5
  const emissiveIntensity = 0.5

  const geometryRef = useRef<THREE.SphereGeometry>(null)
  const materialRef = useRef<THREE.MeshPhongMaterial>(null)
  const currentColor = useColorTransition(color)

  const geometry = useMemo(() => {
    const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments)
    const positions = sphereGeometry.attributes.position.array
    const normals = sphereGeometry.attributes.normal.array

    for (let i = 0; i < positions.length; i += 3) {
      // Get the average of nearby frequencies for smoother displacement
      let sum = 0
      let count = 0
      const dataIndex = Math.floor((i / positions.length) * data.length)
      for (let j = -2; j <= 2; j++) {
        const index = dataIndex + j
        if (index >= 0 && index < data.length) {
          sum += data[index]
          count++
        }
      }
      const value = (sum / count) / 255
      
      positions[i] += normals[i] * value * displacementScale
      positions[i + 1] += normals[i + 1] * value * displacementScale
      positions[i + 2] += normals[i + 2] * value * displacementScale
    }

    sphereGeometry.attributes.position.needsUpdate = true
    sphereGeometry.computeVertexNormals()
    return sphereGeometry
  }, [data, radius, segments, displacementScale])

  return (
    <mesh>
      <primitive object={geometry} attach="geometry" ref={geometryRef} />
      <meshPhongMaterial
        ref={materialRef}
        color={currentColor}
        emissive={currentColor}
        emissiveIntensity={emissiveIntensity}
        wireframe={false}
      />
    </mesh>
  )
}

export default SphereEffect 