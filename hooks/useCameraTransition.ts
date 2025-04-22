import { useState, useRef, useEffect } from 'react'
import { Vector3, Quaternion, Euler } from 'three'
import { smoothCameraTransition } from '../utils/cameraTransitions'
import { getCameraPreset } from '../components/camera/cameraRegistry'

interface CameraTransitionState {
  isTransitioning: boolean
  selectedView: string
}

export const useCameraTransition = (controlsRef: React.RefObject<any>) => {
  const [state, setState] = useState<CameraTransitionState>({
    isTransitioning: false,
    selectedView: 'Front'
  })
  const transitionRef = useRef<(() => void) | null>(null)

  const handleCameraChange = (presetName: string) => {
    if (state.isTransitioning) {
      // Cancel any ongoing transition
      if (transitionRef.current) {
        transitionRef.current()
      }
    }

    if (!controlsRef.current) {
      console.error('Camera controls not initialized')
      return
    }

    const preset = getCameraPreset(presetName)
    if (!preset) {
      console.error(`Camera preset '${presetName}' not found`)
      return
    }

    const startState = {
      position: controlsRef.current.object.position.clone(),
      target: controlsRef.current.target.clone()
    }

    const endState = {
      position: new Vector3(preset.position.x, preset.position.y, preset.position.z),
      target: new Vector3(0, 0, 0),
      rotation: preset.rotation ? new Quaternion().setFromEuler(
        new Euler(preset.rotation.x, preset.rotation.y, preset.rotation.z)
      ) : undefined
    }

    setState(prev => ({ ...prev, isTransitioning: true, selectedView: presetName }))

    transitionRef.current = smoothCameraTransition(
      startState,
      endState,
      1500, // 1.5 second transition for smoother motion
      (state) => {
        if (controlsRef.current) {
          controlsRef.current.target.copy(state.target)
          controlsRef.current.object.position.copy(state.position)
          if (state.rotation) {
            controlsRef.current.object.quaternion.copy(state.rotation)
          }
          controlsRef.current.update()
        }
      },
      () => {
        setState(prev => ({ ...prev, isTransitioning: false }))
        transitionRef.current = null
      }
    )
  }

  // Add keyboard event listener for camera controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          handleCameraChange('Front')
          break
        case 'ArrowDown':
          handleCameraChange('Back')
          break
        case 'ArrowLeft':
          handleCameraChange('Left')
          break
        case 'ArrowRight':
          handleCameraChange('Right')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  // Cleanup transition on unmount
  useEffect(() => {
    return () => {
      if (transitionRef.current) {
        transitionRef.current()
      }
    }
  }, [])

  return {
    ...state,
    handleCameraChange
  }
} 