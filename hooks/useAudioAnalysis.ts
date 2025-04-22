import { useState, useEffect, useRef } from 'react'

interface AudioAnalysisState {
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  dataArray: Uint8Array | null
  isPlaying: boolean
  error: string | null
  showVisualizer: boolean
}

export const useAudioAnalysis = () => {
  const [state, setState] = useState<AudioAnalysisState>({
    audioContext: null,
    analyser: null,
    dataArray: null,
    isPlaying: false,
    error: null,
    showVisualizer: false
  })
  const streamRef = useRef<MediaStream | null>(null)

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyserNode = audioCtx.createAnalyser()
      
      analyserNode.fftSize = 2048
      analyserNode.smoothingTimeConstant = 0.8
      const bufferLength = analyserNode.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      source.connect(analyserNode)
      
      setState({
        audioContext: audioCtx,
        analyser: analyserNode,
        dataArray,
        isPlaying: true,
        error: null,
        showVisualizer: true
      })

      streamRef.current = stream

      const updateVisualization = () => {
        if (analyserNode && dataArray) {
          analyserNode.getByteFrequencyData(dataArray)
          setState(prev => ({ ...prev, dataArray: new Uint8Array(dataArray) }))
        }
        requestAnimationFrame(updateVisualization)
      }

      updateVisualization()

      // Handle stream ending
      stream.getVideoTracks()[0].onended = () => {
        if (audioCtx) {
          audioCtx.close()
        }
        setState(prev => ({
          ...prev,
          isPlaying: false,
          showVisualizer: false,
          error: 'Screen sharing ended. Please click "Start Visualization" to restart.'
        }))
      }

    } catch (error) {
      console.error('Error accessing audio:', error)
      setState(prev => ({
        ...prev,
        isPlaying: false,
        showVisualizer: false,
        error: `Failed to access audio: ${error.message}`
      }))
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.audioContext) {
        state.audioContext.close()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    ...state,
    startAnalysis
  }
} 