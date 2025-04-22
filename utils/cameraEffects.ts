import { Vector3 } from 'three'

export interface CameraPreset {
  position: Vector3
  target: Vector3
  name: string
}

// This file is kept for backward compatibility
// New code should use the camera registry in components/camera/cameraRegistry.ts
export const cameraPresets: Record<string, CameraPreset> = {} 