export interface SettingDefinition {
  type: 'number' | 'boolean' | 'select'
  label: string
  description?: string
  min?: number
  max?: number
  step?: number
  options?: Array<{
    value: string
    label: string
  }>
}

export interface StarsEffectSettings {
  count: number
  baseSize: number
  maxSize: number
  distributionRange: number
  emissiveIntensity: number
}

export interface EffectSettingsProps {
  settings: Record<string, any>
  onSettingsUpdate: (newSettings: any) => void
}

export interface EffectSettings {
  effectName: string
  settings: Record<string, any>
} 