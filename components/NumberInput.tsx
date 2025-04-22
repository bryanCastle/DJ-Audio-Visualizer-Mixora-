import React from 'react'

interface NumberInputProps {
  value: number | undefined
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  step?: number
}

export const NumberInput = ({ value = 0, min, max, onChange, label, step = 1 }: NumberInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(min, Math.min(max, Number(e.target.value)))
    onChange(newValue)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label style={{ color: 'white', fontSize: '0.875rem' }}>{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          color: 'white',
          fontSize: '0.875rem'
        }}
      />
    </div>
  )
} 