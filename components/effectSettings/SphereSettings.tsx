import { NumberInput } from '../NumberInput'
import { EffectSettingsProps } from './types'

export const SphereSettings = ({ settings, onSettingsUpdate }: EffectSettingsProps) => {
  return (
    <>
      <NumberInput
        label="Radius"
        value={settings?.radius || 1}
        min={1}
        max={5}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, radius: value })}
      />
      <NumberInput
        label="Segments"
        value={settings?.segments || 32}
        min={8}
        max={64}
        step={1}
        onChange={(value) => onSettingsUpdate({ ...settings, segments: value })}
      />
      <NumberInput
        label="Displacement Scale"
        value={settings?.displacementScale || 0.5}
        min={0}
        max={1}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, displacementScale: value })}
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