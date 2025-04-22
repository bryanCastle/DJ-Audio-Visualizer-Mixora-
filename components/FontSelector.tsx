import React, { useState } from 'react'
import { FontInfo, getAvailableFonts } from '../utils/fontUtils'

interface FontSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  value,
  onChange,
  label = 'Font',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const fonts = getAvailableFonts()
  const selectedFont = fonts.find(font => font.value === value) || fonts[0]

  return (
    <div className={`mb-4 ${className}`}>
      <label style={{ 
        color: 'white', 
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
        display: 'block'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{selectedFont?.label}</span>
          <span style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>▼</span>
        </div>
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            {fonts.map((font) => (
              <div
                key={font.value}
                onClick={() => {
                  onChange(font.value)
                  setIsOpen(false)
                }}
                style={{
                  padding: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: font.value === value ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = font.value === value ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                }}
              >
                {font.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 