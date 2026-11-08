import { describe, expect, it } from 'vitest'
import type { Session } from '../types'
import { dayKey, summarize, UNNAMED } from './stats'

const NOW = new Date(2026, 10, 8, 15, 0).getTime() // 08/11/2026 15:00 (mês começa em 0)
const DAY = 24 * 60 * 60 * 1000

function session(partial: Partial<Session>): Session {
  return {
    id: Math.random().toString(),
    name: 'Estudar',
    phase: 'focus',
    startedAt: NOW,
    endedAt: NOW,
    plannedSec: 1500,
    actualSec: 1500,
    completed: true,
    ...partial,
  }
}

describe('summarize', () => {
  const sessions: Session[] = [
    session({ startedAt: NOW - 60_000 }), // hoje, 25 min
    session({ startedAt: NOW - 120_000, actualSec: 600, completed: false }), // hoje, interrompido, 10 min
    session({ startedAt: NOW - 2 * DAY, name: 'Ler' }), // 2 dias atrás
    session({ startedAt: NOW - 10 * DAY, name: '' }), // fora dos 7 dias
  ]
  const stats = summarize(sessions, NOW)

  it('conta hoje: só concluídos no count, todos nos minutos', () => {
    expect(stats.today.count).toBe(1)
    expect(stats.today.minutes).toBe(35)
  })

  it('soma os últimos 7 dias e o total', () => {
    expect(stats.last7).toEqual({ count: 2, minutes: 60 })
    expect(stats.total).toEqual({ count: 3, minutes: 85 })
  })

  it('gera 7 dias terminando hoje', () => {
    expect(stats.last7Days).toHaveLength(7)
    expect(stats.last7Days[6].key).toBe(dayKey(NOW))
    expect(stats.last7Days[4].minutes).toBe(25)
  })

  it('agrupa por nome, ordenado por minutos, e usa "Sem nome" para vazio', () => {
    expect(stats.byName.map((n) => n.name)).toEqual(['Estudar', 'Ler', UNNAMED])
    expect(stats.byName[0].minutes).toBe(35)
  })

  it('funciona sem sessões', () => {
    const empty = summarize([], NOW)
    expect(empty.total).toEqual({ count: 0, minutes: 0 })
    expect(empty.byName).toEqual([])
  })
})
