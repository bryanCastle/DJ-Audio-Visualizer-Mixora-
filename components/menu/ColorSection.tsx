import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/visualizerStore';

interface GradientStop {
  color: string;
  position: number;
}

interface UserGradient {
  id: string;
  name: string;
  stops: GradientStop[];
}

interface ColorSectionProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  recentColors: string[];
  setRecentColors: (updater: (prev: string[]) => string[]) => void;
  userGradients: UserGradient[];
  setUserGradients: (updater: (prev: UserGradient[]) => UserGradient[]) => void;
  activeGradient: UserGradient | null;
  setActiveGradient: (gradient: UserGradient | null) => void;
  gradientProgress: number;
  setGradientProgress: (updater: (prev: number) => number) => void;
  wledEnabled: boolean;
  wledDeviceIp: string;
}

export const ColorSection = memo(({
  currentColor,
  onColorChange,
  recentColors,
  setRecentColors,
  userGradients,
  setUserGradients,
  activeGradient,
  setActiveGradient,
  gradientProgress,
  setGradientProgress,
  wledEnabled,
  wledDeviceIp
}: ColorSectionProps) => {
  const { wledService } = useStore();
  const [isCreatingGradient, setIsCreatingGradient] = useState(false);
  const [newGradientName, setNewGradientName] = useState('');
  const [newGradientStops, setNewGradientStops] = useState<GradientStop[]>([
    { color: '#ff0000', position: 0 },
    { color: '#0000ff', position: 100 }
  ]);
  const gradientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedColorUpdate = useRef<NodeJS.Timeout | null>(null);

  const handleColorChange = useCallback((color: string) => {
    console.log('[ColorSection] Color change:', color);
    onColorChange(color);
    setRecentColors(prev => {
      const [white, black, ...otherColors] = prev;
      
      if (color === white || color === black) {
        return prev;
      }
      
      if (otherColors.includes(color)) {
        return prev;
      }
      
      const updated = [white, black, color, ...otherColors];
      return updated.slice(0, 10);
    });

    if (wledEnabled && wledService) {
      console.log('[ColorSection] Updating WLED with color:', color);
      wledService.setColor(color).catch(error => {
        console.error('[ColorSection] Error updating WLED:', error);
      });
    }
  }, [wledEnabled, wledService, onColorChange, setRecentColors]);

  const handleAddGradientStop = useCallback(() => {
    if (newGradientStops.length < 5) {
      setNewGradientStops([...newGradientStops, { color: '#ffffff', position: 50 }]);
    }
  }, [newGradientStops]);

  const handleRemoveGradientStop = useCallback((index: number) => {
    if (newGradientStops.length > 2) {
      setNewGradientStops(newGradientStops.filter((_, i) => i !== index));
    }
  }, [newGradientStops]);

  const handleUpdateGradientStop = useCallback((index: number, updates: Partial<GradientStop>) => {
    const updatedStops = [...newGradientStops];
    updatedStops[index] = { ...updatedStops[index], ...updates };
    setNewGradientStops(updatedStops);
  }, [newGradientStops]);

  const handleSaveGradient = useCallback(() => {
    if (newGradientName.trim() && newGradientStops.length >= 2) {
      const newGradient: UserGradient = {
        id: Date.now().toString(),
        name: newGradientName.trim(),
        stops: [...newGradientStops]
      };

      setUserGradients(prev => {
        const updated = [...prev, newGradient];
        if (updated.length > 4) {
          return updated.slice(1);
        }
        return updated;
      });

      setIsCreatingGradient(false);
      setNewGradientName('');
      setNewGradientStops([
        { color: '#ff0000', position: 0 },
        { color: '#0000ff', position: 100 }
      ]);
    }
  }, [newGradientName, newGradientStops, setUserGradients]);

  const handleGradientClick = useCallback((gradient: UserGradient) => {
    if (activeGradient?.id === gradient.id) {
      if (gradientIntervalRef.current) {
        clearInterval(gradientIntervalRef.current);
        gradientIntervalRef.current = null;
      }
      setActiveGradient(null);
      return;
    }

    if (gradientIntervalRef.current) {
      clearInterval(gradientIntervalRef.current);
    }

    setActiveGradient(gradient);
    setGradientProgress(() => 0);

    const duration = 5000;
    const steps = 100;
    const interval = duration / steps;

    gradientIntervalRef.current = setInterval(() => {
      setGradientProgress(prev => {
        const newProgress = (prev + 1) % steps;
        return newProgress;
      });
    }, interval);
  }, [activeGradient, setActiveGradient, setGradientProgress]);

  useEffect(() => {
    if (activeGradient && gradientProgress > 0) {
      if (debouncedColorUpdate.current) {
        clearTimeout(debouncedColorUpdate.current);
      }

      debouncedColorUpdate.current = setTimeout(() => {
        const stops = activeGradient.stops;
        const totalStops = stops.length;
        
        const normalizedProgress = gradientProgress / 100;
        const segmentSize = 1 / (totalStops - 1);
        const currentSegment = Math.floor(normalizedProgress / segmentSize);
        const localProgress = (normalizedProgress % segmentSize) / segmentSize;
        
        const startIndex = Math.min(currentSegment, totalStops - 2);
        const endIndex = startIndex + 1;
        
        const startColor = new THREE.Color(stops[startIndex].color);
        const endColor = new THREE.Color(stops[endIndex].color);
        const currentColor = new THREE.Color();
        currentColor.r = startColor.r + (endColor.r - startColor.r) * localProgress;
        currentColor.g = startColor.g + (endColor.g - startColor.g) * localProgress;
        currentColor.b = startColor.b + (endColor.b - startColor.b) * localProgress;
        
        onColorChange(`#${currentColor.getHexString()}`);
      }, 16);
    }
  }, [activeGradient, gradientProgress, onColorChange]);

  useEffect(() => {
    return () => {
      if (gradientIntervalRef.current) {
        clearInterval(gradientIntervalRef.current);
        gradientIntervalRef.current = null;
      }
      if (debouncedColorUpdate.current) {
        clearTimeout(debouncedColorUpdate.current);
        debouncedColorUpdate.current = null;
      }
    };
  }, []);

  return (
    <div style={{ minWidth: '200px' }}>
      <h3 style={{ 
        color: 'white', 
        fontSize: '1rem',
        fontWeight: 500,
        marginBottom: '0.75rem',
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}>Colors (1-10)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {recentColors.map((color, index) => (
          <button
            key={index}
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: color,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer'
            }}
            onClick={() => handleColorChange(color)}
            title={`Press ${index + 1} to select`}
          />
        ))}
      </div>
      <input
        type="color"
        value={currentColor}
        onChange={(e) => handleColorChange(e.target.value)}
        style={{
          width: '100%',
          height: '2.5rem',
          borderRadius: '0.75rem',
          cursor: 'pointer'
        }}
      />

      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ 
          color: 'white', 
          fontSize: '1rem',
          fontWeight: 500,
          marginBottom: '0.75rem',
          letterSpacing: '0.025em',
          textTransform: 'uppercase'
        }}>Color Gradients</h3>

        {userGradients.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {userGradients.map((gradient) => (
              <div
                key={gradient.id}
                onClick={() => handleGradientClick(gradient)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.5rem',
                  backgroundColor: activeGradient?.id === gradient.id 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  border: activeGradient?.id === gradient.id 
                    ? '1px solid rgba(255, 255, 255, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ color: 'white', fontSize: '0.875rem' }}>{gradient.name}</span>
                <div style={{ 
                  width: '2rem', 
                  height: '1rem',
                  background: `linear-gradient(to right, ${gradient.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`,
                  borderRadius: '0.25rem'
                }} />
              </div>
            ))}
          </div>
        )}

        {!isCreatingGradient ? (
          <button
            onClick={() => setIsCreatingGradient(true)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Create New Gradient
          </button>
        ) : (
          <div style={{ 
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem'
          }}>
            <input
              type="text"
              value={newGradientName}
              onChange={(e) => setNewGradientName(e.target.value)}
              placeholder="Gradient name"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem'
              }}
            />
            
            <div style={{ 
              height: '2rem',
              marginBottom: '0.75rem',
              background: `linear-gradient(to right, ${newGradientStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`,
              borderRadius: '0.5rem'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {newGradientStops.map((stop, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => handleUpdateGradientStop(index, { color: e.target.value })}
                    style={{ width: '2rem', height: '2rem' }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => handleUpdateGradientStop(index, { position: Number(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  {newGradientStops.length > 2 && (
                    <button
                      onClick={() => handleRemoveGradientStop(index)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'rgba(255, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 0, 0, 0.3)',
                        borderRadius: '0.25rem',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              {newGradientStops.length < 5 && (
                <button
                  onClick={handleAddGradientStop}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Add Stop
                </button>
              )}
              <button
                onClick={handleSaveGradient}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: 'rgba(0, 255, 0, 0.2)',
                  border: '1px solid rgba(0, 255, 0, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Save Gradient
              </button>
              <button
                onClick={() => setIsCreatingGradient(false)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}); 