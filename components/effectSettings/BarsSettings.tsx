import { NumberInput } from '../NumberInput'
import { EffectSettingsProps } from './types'

export const BarsSettings = ({ settings, onSettingsUpdate }: EffectSettingsProps) => {
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
        label="Bar Count"
        value={settings?.count || 32}
        min={8}
        max={64}
        step={1}
        onChange={(value) => onSettingsUpdate({ ...settings, count: value })}
      />
    </>
  )
} 