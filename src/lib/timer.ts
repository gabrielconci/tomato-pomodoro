import type { Phase, Settings } from '../types'

// `Record<Phase, string>` = objeto com uma chave para cada fase, todas com valor string.
// Se faltar alguma fase, o TypeScript acusa erro.
export const PHASE_LABELS: Record<Phase, string> = {
  focus: 'Foco',
  shortBreak: 'Pausa curta',
  longBreak: 'Pausa longa',
}

export function phaseDurationSec(phase: Phase, settings: Settings): number {
  const minutes: Record<Phase, number> = {
    focus: settings.focusMin,
    shortBreak: settings.shortBreakMin,
    longBreak: settings.longBreakMin,
  }
  return Math.round(minutes[phase] * 60)
}

/**
 * Decide a próxima fase.
 * @param completedFocus total de focos concluídos, já contando o atual se ele terminou.
 */
export function nextPhase(current: Phase, completedFocus: number, settings: Settings): Phase {
  if (current !== 'focus') return 'focus'
  const isLong = completedFocus > 0 && completedFocus % settings.cyclesUntilLongBreak === 0
  return isLong ? 'longBreak' : 'shortBreak'
}

/** Segundos que faltam até `endsAt`. Calcular a partir do relógio evita atrasos do setInterval. */
export function remainingSec(endsAt: number, now: number): number {
  return Math.max(0, Math.ceil((endsAt - now) / 1000))
}

/** 125 -> "02:05" */
export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
