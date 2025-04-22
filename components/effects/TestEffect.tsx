import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface TestEffectProps {
  data: Uint8Array
  color: string
  settings: {
    count: number
    size: number
    speed: number
    spread: number
  }
}

// Custom shader for bloom effect
const particleVertexShader = `
  attribute float size;
  attribute vec3 velocity;
  varying float vSize;
  varying float vIntensity;

  void main() {
    vSize = size;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragmentShader = `
  uniform vec3 color;
  varying float vSize;
  varying float vIntensity;

  void main() {
    float r = 0.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
      discard;
    }
    
    // Create a smooth falloff from center to edge
    float intensity = 1.0 - r;
    
    // Add a stronger glow effect
    float glow = pow(intensity, 1.5);
    
    // Combine base color with stronger glow
    vec3 finalColor = color * (intensity + glow * 1.2);
    
    gl_FragColor = vec4(finalColor, intensity);
  }
`

const TestEffect = ({ data, color, settings }: TestEffectProps) => {
  const { count, size, speed, spread } = settings
  const particlesRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const colorRef = useRef(new THREE.Color(color))

  // Create particle geometry
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Random initial position within spread
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread

      // Random initial velocity
      velocities[i * 3] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed

      // Random size
      sizes[i] = Math.random() * size
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    return geometry
  }, [count, size, speed, spread])

  // Update particles every frame
  useFrame(() => {
    if (!particlesRef.current || !data) return

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    const velocities = particlesRef.current.geometry.attributes.velocity.array as Float32Array
    const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array

    // Get average frequency value
    const average = data.reduce((sum, val) => sum + val, 0) / data.length
    const normalizedValue = average / 255

    for (let i = 0; i < count; i++) {
      // Update position based on velocity
      positions[i * 3] += velocities[i * 3] * normalizedValue
      positions[i * 3 + 1] += velocities[i * 3 + 1] * normalizedValue
      positions[i * 3 + 2] += velocities[i * 3 + 2] * normalizedValue

      // Bounce off boundaries
      if (Math.abs(positions[i * 3]) > spread / 2) velocities[i * 3] *= -1
      if (Math.abs(positions[i * 3 + 1]) > spread / 2) velocities[i * 3 + 1] *= -1
      if (Math.abs(positions[i * 3 + 2]) > spread / 2) velocities[i * 3 + 2] *= -1

      // Update size based on audio
      sizes[i] = size * (0.5 + normalizedValue)
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
    particlesRef.current.geometry.attributes.size.needsUpdate = true
  })

  // Update color when it changes
  useEffect(() => {
    if (materialRef.current) {
      colorRef.current.set(color)
      materialRef.current.uniforms.color.value = colorRef.current
    }
  }, [color])

  return (
    <points ref={particlesRef}>
      <primitive object={geometry} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={{
          color: { value: colorRef.current }
        }}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default TestEffect 