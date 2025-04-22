import { EffectDefinition } from './types'

interface EffectItemProps {
  effect: EffectDefinition
  isActive: boolean
  isSelected: boolean
  currentColor: string
  onToggle: (effectId: string) => void
  onSelect: (effectId: string) => void
}

export const EffectItem = ({
  effect,
  isActive,
  isSelected,
  currentColor,
  onToggle,
  onSelect
}: EffectItemProps) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.75rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        cursor: 'pointer'
      }}
    >
      <div
        onClick={() => onToggle(effect.id)}
        style={{
          width: '1rem',
          height: '1rem',
          borderRadius: '0.25rem',
          backgroundColor: isActive ? currentColor : 'transparent',
          border: `1px solid ${isActive ? currentColor : 'rgba(255, 255, 255, 0.2)'}`,
          cursor: 'pointer'
        }}
      />
      <button
        style={{
          flex: 1,
          textAlign: 'left',
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: 400,
          letterSpacing: '0.01em',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem 0',
          opacity: isSelected ? 1 : 0.7,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
        onClick={() => onSelect(effect.id)}
      >
        <span>{effect.icon}</span>
        <span>{effect.name}</span>
      </button>
    </div>
  )
} 