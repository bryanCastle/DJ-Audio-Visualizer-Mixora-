import React, { memo } from 'react';
import { EffectSettingsComponent } from '../effectSettings/EffectSettings';

interface EffectSettingsSectionProps {
  selectedEffect: string;
  effectSettings: any;
  onSettingsUpdate: (newSettings: any) => void;
}

export const EffectSettingsSection = memo(({
  selectedEffect,
  effectSettings,
  onSettingsUpdate
}: EffectSettingsSectionProps) => {
  if (!selectedEffect) return null;

  return (
    <div style={{ minWidth: '200px' }}>
      <h3 style={{ 
        color: 'white', 
        fontSize: '1rem',
        fontWeight: 500,
        marginBottom: '0.75rem',
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}>Effect Settings</h3>
      <EffectSettingsComponent
        settings={{
          effectName: selectedEffect,
          settings: effectSettings[selectedEffect]
        }}
        onSettingsUpdate={onSettingsUpdate}
      />
    </div>
  );
}); 