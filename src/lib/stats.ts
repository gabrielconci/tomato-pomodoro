import type { Session } from '../types'

export const UNNAMED = 'Sem nome'

export interface Totals {
  /** Focos concluídos. */
  count: number
  /** Minutos de foco, contando também os interrompidos. */
  minutes: number
}

export interface DayStat extends Totals {
  key: string // "2026-11-08"
  label: string // "sáb."
}

export interface NameStat extends Totals {
  name: string
}

export interface StatsSummary {
  today: Totals
  last7: Totals
  total: Totals
  last7Days: DayStat[]
  byName: NameStat[]
}

/** Chave do dia no fuso local, ex.: "2026-11-08". */
export function dayKey(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function totalsOf(sessions: Session[]): Totals {
  const seconds = sessions.reduce((sum, s) => sum + s.actualSec, 0)
  return {
    count: sessions.filter((s) => s.completed).length,
    minutes: Math.round(seconds / 60),
  }
}

export function summarize(sessions: Session[], now: number = Date.now()): StatsSummary {
  const focus = sessions.filter((s) => s.phase === 'focus')

  // Os últimos 7 dias, do mais antigo até hoje.
  const days: DayStat[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const key = dayKey(date.getTime())
    days.push({
      key,
      label: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      ...totalsOf(focus.filter((s) => dayKey(s.startedAt) === key)),
    })
  }
  const last7Keys = new Set(days.map((d) => d.key))

  // Agrupa por nome.
  const groups = new Map<string, Session[]>()
  for (const s of focus) {
    const name = s.name.trim() || UNNAMED
    groups.set(name, [...(groups.get(name) ?? []), s])
  }
  const byName: NameStat[] = [...groups.entries()]
    .map(([name, list]) => ({ name, ...totalsOf(list) }))
    .sort((a, b) => b.minutes - a.minutes)

  return {
    today: days[days.length - 1],
    last7: totalsOf(focus.filter((s) => last7Keys.has(dayKey(s.startedAt)))),
    total: totalsOf(focus),
    last7Days: days,
    byName,
  }
}
