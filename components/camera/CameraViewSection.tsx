import { CameraPreset } from './types'

interface CameraViewSectionProps {
  selectedView: string
  onViewChange: (view: string) => void
  cameraEffect?: string
  onCameraEffectChange?: (effect: string | null) => void
  presets: CameraPreset[]
}

export const CameraViewSection = ({
  selectedView,
  onViewChange,
  cameraEffect,
  onCameraEffectChange,
  presets
}: CameraViewSectionProps) => {
  return (
    <div style={{ minWidth: '250px' }}>
      <h3 style={{ 
        color: 'white', 
        fontSize: '1rem',
        fontWeight: 500,
        marginBottom: '0.75rem',
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}>CAMERA VIEW</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {presets.map((preset) => (
          <button
            key={preset.name}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 400,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              opacity: selectedView === preset.name ? 1 : 0.7,
              backgroundColor: selectedView === preset.name 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)'
            }}
            onClick={() => onViewChange(preset.name)}
          >
            {preset.name}
          </button>
        ))}
        {/* BPM Camera Effect Option */}
        <button
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 400,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left',
            opacity: selectedView === 'BPM' ? 1 : 0.7,
            backgroundColor: selectedView === 'BPM' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(255, 255, 255, 0.1)'
          }}
          onClick={() => {
            if (selectedView === 'BPM') {
              onViewChange('')
              if (onCameraEffectChange) onCameraEffectChange('')
            } else {
              onViewChange('BPM')
              if (onCameraEffectChange) onCameraEffectChange('bpm')
            }
          }}
        >
          BPM
        </button>
      </div>
    </div>
  )
} 