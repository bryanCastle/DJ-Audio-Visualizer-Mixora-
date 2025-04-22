import React, { memo, useCallback, useMemo } from 'react';
import { getAllEffects } from '../effects/effectRegistry';
import { EffectItem } from '../effects/EffectItem';

interface EffectsSectionProps {
  activeEffects: string[];
  onEffectChange: (effects: string[]) => void;
  selectedEffect: string;
  onEffectSelect: (effect: string) => void;
  currentColor: string;
}

export const EffectsSection = memo(({ 
  activeEffects, 
  onEffectChange, 
  selectedEffect, 
  onEffectSelect,
  currentColor 
}: EffectsSectionProps) => {
  const handleEffectToggle = useCallback((effectId: string) => {
    if (activeEffects.includes(effectId)) {
      onEffectChange(activeEffects.filter(e => e !== effectId));
    } else {
      onEffectChange([...activeEffects, effectId]);
    }
  }, [activeEffects, onEffectChange]);

  const effects = useMemo(() => getAllEffects(), []);

  return (
    <div style={{ minWidth: '200px' }}>
      <h3 style={{ 
        color: 'white', 
        fontSize: '1rem',
        fontWeight: 500,
        marginBottom: '0.75rem',
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}>Effects</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {effects.map((effect) => (
          <EffectItem
            key={effect.id}
            effect={effect}
            isActive={activeEffects.includes(effect.id)}
            isSelected={selectedEffect === effect.id}
            currentColor={currentColor}
            onToggle={handleEffectToggle}
            onSelect={onEffectSelect}
          />
        ))}
      </div>
    </div>
  );
}); 