export interface CameraPreset {
  name: string
  position: {
    x: number
    y: number
    z: number
  }
  rotation: {
    x: number
    y: number
    z: number
  }
  description?: string
  icon?: string
  orbitSettings?: {
    autoRotate: boolean
    autoRotateSpeed: number
    enableDamping: boolean
    dampingFactor: number
    minDistance: number
    maxDistance: number
    minPolarAngle: number
    maxPolarAngle: number
    minAzimuthAngle: number
    maxAzimuthAngle: number
  }
} 