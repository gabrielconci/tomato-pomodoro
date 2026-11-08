import { describe, expect, it } from 'vitest'
import type { Phase, Settings } from '../types'
import { formatTime, nextPhase, phaseDurationSec, remainingSec } from './timer'

const settings: Settings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  cyclesUntilLongBreak: 4,
  soundEnabled: true,
  volume: 0.5,
}

describe('nextPhase', () => {
  it('alterna foco e pausa curta, e faz pausa longa a cada 4 focos', () => {
    const sequence: Phase[] = []
    let phase: Phase = 'focus'
    let done = 0
    for (let i = 0; i < 8; i++) {
      if (phase === 'focus') done++
      phase = nextPhase(phase, done, settings)
      sequence.push(phase)
    }
    expect(sequence).toEqual([
      'shortBreak', 'focus', 'shortBreak', 'focus',
      'shortBreak', 'focus', 'longBreak', 'focus',
    ])
  })

  it('foco pulado sem nenhum concluído vai para pausa curta', () => {
    expect(nextPhase('focus', 0, settings)).toBe('shortBreak')
  })

  it('depois de qualquer pausa vem foco', () => {
    expect(nextPhase('shortBreak', 1, settings)).toBe('focus')
    expect(nextPhase('longBreak', 4, settings)).toBe('focus')
  })
})

describe('phaseDurationSec', () => {
  it('converte minutos em segundos', () => {
    expect(phaseDurationSec('focus', settings)).toBe(1500)
    expect(phaseDurationSec('shortBreak', settings)).toBe(300)
    expect(phaseDurationSec('longBreak', settings)).toBe(900)
  })
})

describe('remainingSec', () => {
  it('arredonda para cima e nunca fica negativo', () => {
    expect(remainingSec(10_000, 0)).toBe(10)
    expect(remainingSec(10_000, 9_001)).toBe(1)
    expect(remainingSec(10_000, 12_000)).toBe(0)
  })
})

describe('formatTime', () => {
  it('formata mm:ss', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(125)).toBe('02:05')
    expect(formatTime(1500)).toBe('25:00')
  })
})
