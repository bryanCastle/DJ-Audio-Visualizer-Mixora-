import { NumberInput } from '../NumberInput'
import { EffectSettingsProps } from './types'

export const WaveSettings = ({ settings, onSettingsUpdate }: EffectSettingsProps) => {
  return (
    <>
      <NumberInput
        label="Height Multiplier"
        value={settings?.heightMultiplier || 1}
        min={0}
        max={10}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, heightMultiplier: value })}
      />
      <NumberInput
        label="Line Width"
        value={settings?.lineWidth || 1}
        min={1}
        max={5}
        step={0.1}
        onChange={(value) => onSettingsUpdate({ ...settings, lineWidth: value })}
      />
    </>
  )
} 