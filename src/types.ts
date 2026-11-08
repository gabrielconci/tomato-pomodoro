// Tipos compartilhados pelo app inteiro.
// Um `type` com '|' (união) só aceita um dos valores listados.
export type Phase = 'focus' | 'shortBreak' | 'longBreak'

// `interface` descreve o formato de um objeto: quais campos ele tem e de que tipo.
export interface Settings {
  focusMin: number
  shortBreakMin: number
  longBreakMin: number
  /** Quantos focos concluídos até a pausa longa. */
  cyclesUntilLongBreak: number
  soundEnabled: boolean
  /** Volume de 0 a 1. */
  volume: number
}

/** Um período de foco salvo no histórico. */
export interface Session {
  id: string
  name: string
  phase: Phase
  /** Timestamps em milissegundos (Date.now()). */
  startedAt: number
  endedAt: number
  plannedSec: number
  actualSec: number
  /** false quando o usuário pulou ou resetou antes do fim. */
  completed: boolean
}
