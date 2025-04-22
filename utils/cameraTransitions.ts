import { Vector3, Quaternion } from 'three'

interface CameraState {
  position: Vector3
  target: Vector3
  rotation?: Quaternion
}

export const lerpCamera = (
  start: CameraState,
  end: CameraState,
  progress: number
): CameraState => {
  const position = new Vector3().lerpVectors(start.position, end.position, progress)
  const target = new Vector3().lerpVectors(start.target, end.target, progress)
  
  // Calculate rotation quaternion
  const startDirection = new Vector3().subVectors(start.target, start.position).normalize()
  const endDirection = new Vector3().subVectors(end.target, end.position).normalize()
  
  const startQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), startDirection)
  const endQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), endDirection)
  
  const rotation = new Quaternion().slerpQuaternions(startQuat, endQuat, progress)

  return {
    position,
    target,
    rotation
  }
}

export const smoothCameraTransition = (
  start: CameraState,
  end: CameraState,
  duration: number,
  onUpdate: (state: CameraState) => void,
  onComplete?: () => void
) => {
  let startTime = Date.now()
  let animationFrameId: number

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Use cubic easing for smoother motion
    const smoothProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    
    const currentState = lerpCamera(start, end, smoothProgress)
    onUpdate(currentState)

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      if (onComplete) onComplete()
    }
  }

  animate()

  return () => {
    cancelAnimationFrame(animationFrameId)
  }
} 