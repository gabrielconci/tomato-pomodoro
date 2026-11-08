import type { Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

/** Interruptor deslizante: bolinha à esquerda = claro, à direita = escuro. */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Tema escuro"
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      onClick={onToggle}
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full bg-slate-300 transition-colors dark:bg-slate-700"
    >
      {/* `translate-x-*` move a bolinha; `transition-transform` anima o movimento. */}
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow transition-transform dark:bg-slate-950 ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
