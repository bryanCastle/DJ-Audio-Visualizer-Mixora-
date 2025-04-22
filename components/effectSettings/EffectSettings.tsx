import { EffectSettingsProps } from './types'
import { getEffectComponent } from './effectRegistry'

export const EffectSettingsComponent = ({ settings, onSettingsUpdate }: EffectSettingsProps) => {
  const EffectSettingsComponent = getEffectComponent(settings.effectName)
  
  if (!EffectSettingsComponent) {
    return null
  }

  const handleSettingsUpdate = (newSettings: any) => {
    onSettingsUpdate({
      effectName: settings.effectName,
      settings: newSettings
    })
  }

  return (
    <div style={{ minWidth: '250px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <EffectSettingsComponent 
          settings={settings.settings} 
          onSettingsUpdate={handleSettingsUpdate} 
        />
      </div>
    </div>
  )
} 