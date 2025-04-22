import { NumberInput } from '../NumberInput'
import { EffectSettingsProps } from './types'

interface TestEffectSettings {
  count: number
  size: number
  speed: number
  spread: number
}

export const TestSettings: React.FC<EffectSettingsProps> = ({ settings, onSettingsUpdate }) => {
  const handleChange = (key: keyof TestEffectSettings, value: number) => {
    onSettingsUpdate({ ...settings, [key]: value })
  }

  return (
    <>
      <NumberInput
        label="Particle Count"
        value={settings?.count || 100}
        onChange={(value) => handleChange('count', value)}
        min={1}
        max={1000}
        step={1}
      />
      <NumberInput
        label="Particle Size"
        value={settings?.size || 0.1}
        onChange={(value) => handleChange('size', value)}
        min={0.01}
        max={1}
        step={0.01}
      />
      <NumberInput
        label="Animation Speed"
        value={settings?.speed || 0.1}
        onChange={(value) => handleChange('speed', value)}
        min={0.01}
        max={1}
        step={0.01}
      />
      <NumberInput
        label="Distribution Spread"
        value={settings?.spread || 10}
        onChange={(value) => handleChange('spread', value)}
        min={1}
        max={50}
        step={1}
      />
    </>
  )
} 