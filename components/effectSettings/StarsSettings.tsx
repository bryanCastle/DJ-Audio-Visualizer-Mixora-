import { NumberInput } from '../NumberInput'
import { EffectSettingsProps, StarsEffectSettings } from './types'

export const StarsSettings = ({ settings, onSettingsUpdate }: EffectSettingsProps) => {
  const starsSettings = settings as StarsEffectSettings

  return (
    <>
      <NumberInput
        label="Star Count"
        value={starsSettings?.count || 100}
        min={1}
        max={200}
        step={1}
        onChange={(value) => onSettingsUpdate({ ...settings, count: value })}
      />
      <NumberInput
        label="Base Size"
        value={starsSettings?.baseSize || 0.1}
        min={0.05}
        max={0.5}
        step={0.01}
        onChange={(value) => onSettingsUpdate({ ...settings, baseSize: value })}
      />
      <NumberInput
        label="Max Size"
        value={starsSettings?.maxSize || 0.3}
        min={0.1}
        max={1}
        step={0.01}
        onChange={(value) => onSettingsUpdate({ ...settings, maxSize: value })}
      />
      <NumberInput
        label="Distribution Range"
        value={starsSettings?.distributionRange || 5}
        min={1}
        max={10}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, distributionRange: value })}
      />
      <NumberInput
        label="Emissive Intensity"
        value={starsSettings?.emissiveIntensity || 0.5}
        min={0}
        max={1}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, emissiveIntensity: value })}
      />
    </>
  )
} 