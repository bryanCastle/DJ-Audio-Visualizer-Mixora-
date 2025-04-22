import React, { useState } from 'react';
import { useStore } from '../store/visualizerStore';
import { NumberInput } from './NumberInput';

const hdriPresets = [
  { name: 'Studio', path: '/hdri/studio.hdr' },
  { name: 'Sky', path: '/hdri/sky.exr' },
  { name: 'Aurora', path: '/hdri/aurora.hdr' },
  { name: 'Galaxy', path: '/hdri/galaxy.hdr' }
];

export const BackgroundSection = () => {
  const { background, setBackground } = useStore();
  const [hdriIntensity, setHdriIntensity] = useState(1);
  const [hdriRotation, setHdriRotation] = useState(0);

  return (
    <div style={{
      minWidth: '200px'
    }}>
      <h3 style={{ 
        color: 'white', 
        fontSize: '1rem',
        fontWeight: 500,
        marginBottom: '0.75rem',
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}>
        Background
      </h3>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          marginBottom: '0.5rem',
          fontSize: '0.9rem'
        }}>
          Color
        </label>
        <input
          type="color"
          value={background.color}
          onChange={(e) => setBackground({ type: 'color', color: e.target.value })}
          style={{
            width: '100%',
            height: '2rem',
            borderRadius: '0.25rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          color: 'white', 
          marginBottom: '0.5rem',
          fontSize: '0.9rem'
        }}>
          HDRI Environment
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {hdriPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setBackground({ type: 'hdri', path: preset.path })}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.25rem',
                padding: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <NumberInput
          label="HDRI Intensity"
          value={hdriIntensity}
          min={0}
          max={2}
          step={0.1}
          onChange={(value) => setHdriIntensity(value)}
        />

        <NumberInput
          label="HDRI Rotation"
          value={hdriRotation}
          min={0}
          max={360}
          step={1}
          onChange={(value) => setHdriRotation(value)}
        />
      </div>
    </div>
  );
}; 