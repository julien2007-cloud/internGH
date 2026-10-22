import type { ThemePref } from '../lib/theme'
import { switchTheme, useTheme } from '../lib/theme'
import type { IconName } from './Icon'
import { Icon } from './Icon'

/** Round sun/moon button: flips between light and dark. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className={`theme-btn ${theme} ${className}`}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={e => {
        const r = e.currentTarget.getBoundingClientRect()
        switchTheme(next, r.left + r.width / 2, r.top + r.height / 2)
      }}
    >
      <span className="sun"><Icon name="sun" size={18} /></span>
      <span className="moon"><Icon name="moon" size={18} /></span>
    </button>
  )
}

const OPTIONS: { id: ThemePref; label: string; icon: IconName }[] = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'system', label: 'System', icon: 'laptop' },
]

/** Light / Dark / System picker for menus. */
export function ThemePicker() {
  const { pref } = useTheme()
  return (
    <div className="theme-picker" role="radiogroup" aria-label="Appearance">
      {OPTIONS.map(o => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={pref === o.id}
          className={pref === o.id ? 'on' : ''}
          onClick={e => {
            const r = e.currentTarget.getBoundingClientRect()
            switchTheme(o.id, r.left + r.width / 2, r.top + r.height / 2)
          }}
        >
          <Icon name={o.icon} size={15} /> {o.label}
        </button>
      ))}
    </div>
  )
}
