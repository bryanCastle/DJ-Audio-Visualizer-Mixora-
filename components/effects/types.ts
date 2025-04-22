export interface EffectDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: 'visual' | 'text' | 'other'
  enabled?: boolean
  order?: number
} 