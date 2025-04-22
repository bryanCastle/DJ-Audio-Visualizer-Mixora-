import { NumberInput } from '../NumberInput'
import { EffectSettingsProps } from './types'

export const ParticlesSettings = ({ settings, onSettingsUpdate }: EffectSettingsProps) => {
  return (
    <>
      <NumberInput
        label="Particle Count"
        value={settings?.count || 100}
        min={50}
        max={500}
        step={1}
        onChange={(value) => onSettingsUpdate({ ...settings, count: value })}
      />
      <NumberInput
        label="Base Size"
        value={settings?.baseSize || 0.1}
        min={0.05}
        max={0.5}
        step={0.01}
        onChange={(value) => onSettingsUpdate({ ...settings, baseSize: value })}
      />
      <NumberInput
        label="Max Size"
        value={settings?.maxSize || 0.3}
        min={0.1}
        max={1}
        step={0.01}
        onChange={(value) => onSettingsUpdate({ ...settings, maxSize: value })}
      />
      <NumberInput
        label="Distribution Range"
        value={settings?.distributionRange || 5}
        min={1}
        max={10}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, distributionRange: value })}
      />
      <NumberInput
        label="Emissive Intensity"
        value={settings?.emissiveIntensity || 1}
        min={0}
        max={2}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, emissiveIntensity: value })}
      />
    </>
  )
} 