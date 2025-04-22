import { SettingDefinition } from './types'

interface SettingsRendererProps {
  settingKey: string
  setting: SettingDefinition
  value: any
  onChange: (value: any) => void
}

export const SettingsRenderer = ({ settingKey, setting, value, onChange }: SettingsRendererProps) => {
  const { type, label, description } = setting

  switch (type) {
    case 'number':
      return (
        <div>
          <label htmlFor={settingKey}>{label}</label>
          {description && <p>{description}</p>}
          <input
            type="number"
            id={settingKey}
            value={value}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      )

    case 'boolean':
      return (
        <div>
          <label htmlFor={settingKey}>
            <input
              type="checkbox"
              id={settingKey}
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
            />
            {label}
          </label>
          {description && <p>{description}</p>}
        </div>
      )

    case 'select':
      if (!setting.options) {
        console.warn(`No options provided for select setting: ${settingKey}`)
        return null
      }
      
      return (
        <div>
          <label htmlFor={settingKey}>{label}</label>
          {description && <p>{description}</p>}
          <select
            id={settingKey}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {setting.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )

    default:
      return null
  }
} 