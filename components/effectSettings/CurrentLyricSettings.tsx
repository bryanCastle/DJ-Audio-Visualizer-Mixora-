import { NumberInput } from '../NumberInput'
import { EffectSettingsProps } from './types'
import { FontSelector } from '../FontSelector'

export const CurrentLyricSettings = ({ settings, onSettingsUpdate }: EffectSettingsProps) => {
  return (
    <>
      <FontSelector
        value={settings?.fontFamily || 'Helvetiker'}
        onChange={(value) => onSettingsUpdate({ ...settings, fontFamily: value })}
        label="Font"
      />
      <NumberInput
        label="Font Size"
        value={settings?.fontSize || 0.5}
        min={0.1}
        max={100}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, fontSize: value })}
      />
      <NumberInput
        label="Depth"
        value={settings?.depth || 0.1}
        min={0.01}
        max={1}
        step={0.01}
        onChange={(value) => onSettingsUpdate({ ...settings, depth: value })}
      />
      <NumberInput
        label="Spacing"
        value={settings?.spacing || 0.1}
        min={0.01}
        max={4}
        step={0.01}
        onChange={(value) => onSettingsUpdate({ ...settings, spacing: value })}
      />
      <NumberInput
        label="Animation Speed"
        value={settings?.animationSpeed || 1}
        min={0.01}
        max={10}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, animationSpeed: value })}
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