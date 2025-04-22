import { CameraPreset } from './types'

const cameraRegistry: Record<string, CameraPreset> = {}

export const registerCameraPreset = (preset: CameraPreset) => {
  cameraRegistry[preset.name] = preset
}

export const getCameraPreset = (name: string): CameraPreset | undefined => {
  return cameraRegistry[name]
}

export const getAllCameraPresets = (): CameraPreset[] => {
  return Object.values(cameraRegistry)
}

// Register all camera presets
registerCameraPreset({
  name: 'Front',
  position: { x: 0, y: 0, z: 5 },
  rotation: { x: 0, y: 0, z: 0 },
  description: 'Front view of the visualization',
  icon: '👁️'
})

registerCameraPreset({
  name: 'Back',
  position: { x: 0, y: 0, z: -5 },
  rotation: { x: 0, y: Math.PI, z: 0 },
  description: 'Back view of the visualization',
  icon: '👁️'
})

registerCameraPreset({
  name: 'Left',
  position: { x: -5, y: 0, z: 0 },
  rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  description: 'Left view of the visualization',
  icon: '👁️'
})

registerCameraPreset({
  name: 'Right',
  position: { x: 5, y: 0, z: 0 },
  rotation: { x: 0, y: Math.PI / 2, z: 0 },
  description: 'Right view of the visualization',
  icon: '👁️'
})

registerCameraPreset({
  name: 'Top',
  position: { x: 0, y: 5, z: 0 },
  rotation: { x: -Math.PI / 2, y: 0, z: 0 },
  description: 'Top-down view of the visualization',
  icon: '⬆️'
})

registerCameraPreset({
  name: 'Side',
  position: { x: 5, y: 2, z: 5 },
  rotation: { x: -Math.PI / 4, y: Math.PI / 4, z: 0 },
  description: 'Side view of the visualization',
  icon: '↔️'
})

registerCameraPreset({
  name: 'Orbit',
  position: { x: 0, y: 2, z: 5 },
  rotation: { x: -Math.PI / 6, y: 0, z: 0 },
  description: 'Orbital view of the visualization',
  icon: '🔄',
  orbitSettings: {
    autoRotate: true,
    autoRotateSpeed: 1.0,
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 3,
    maxDistance: 10,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Math.PI * (70/180),
    maxAzimuthAngle: Math.PI * (70/180)
  }
}) 