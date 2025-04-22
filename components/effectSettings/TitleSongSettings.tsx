import { NumberInput } from '../NumberInput'
import { EffectSettingsProps } from './types'
import { FontSelector } from '../FontSelector'

export const TitleSongSettings = ({ settings, onSettingsUpdate }: EffectSettingsProps) => {
  // Provide default values if settings are undefined
  const safeSettings = {
    size: settings?.size ?? 2.0,
    height: settings?.height ?? 0.5,
    scale: settings?.scale ?? [2, 2, 2],
    fontFamily: settings?.fontFamily ?? 'Helvetiker'
  }

  return (
    <>
      <FontSelector
        value={safeSettings.fontFamily}
        onChange={(value) => onSettingsUpdate({ ...settings, fontFamily: value })}
        label="Font"
      />
      <NumberInput
        label="Font Size"
        value={safeSettings.size}
        min={0.5}
        max={5}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, size: value })}
      />
      <NumberInput
        label="Height"
        value={safeSettings.height}
        min={0.1}
        max={1}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, height: value })}
      />
      <NumberInput
        label="Scale"
        value={safeSettings.scale[0]}
        min={0.5}
        max={5}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, scale: [value, value, value] })}
      />
    </>
  )
} 