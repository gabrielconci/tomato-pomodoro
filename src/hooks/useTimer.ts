import { useEffect, useRef, useState } from 'react'
import { scheduleAlarm } from '../lib/alarm'
import { nextPhase, phaseDurationSec } from '../lib/timer'
import type { Phase, Settings } from '../types'

export type TimerStatus = 'idle' | 'running' | 'paused'

/** O que o timer informa quando uma fase termina (concluída ou interrompida). */
export interface PhaseResult {
  phase: Phase
  startedAt: number
  endedAt: number
  plannedSec: number
  actualSec: number
  completed: boolean
}

/**
 * Controla o timer. O tempo restante vem sempre de `endsAt - agora`,
 * então ele não atrasa mesmo se a aba ficar em segundo plano.
 */
export function useTimer(settings: Settings, onPhaseEnd: (result: PhaseResult) => void) {
  const [phase, setPhase] = useState<Phase>('focus')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [pausedMs, setPausedMs] = useState(0)
  /** Duração fixada ao iniciar; mudar as configurações no meio não afeta a fase atual. */
  const [plannedSec, setPlannedSec] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [completedFocus, setCompletedFocus] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const fullSec = phaseDurationSec(phase, settings)
  const totalSec = status === 'idle' ? fullSec : plannedSec

  function remainingMsAt(time: number): number {
    if (status === 'running' && endsAt !== null) return Math.max(0, endsAt - time)
    if (status === 'paused') return pausedMs
    return fullSec * 1000
  }
  const remainingSec = Math.ceil(remainingMsAt(now) / 1000)

  function start() {
    if (status === 'running') return
    const t = Date.now()
    if (status === 'idle') {
      setPlannedSec(fullSec)
      setStartedAt(t)
    }
    const ms = status === 'paused' ? pausedMs : fullSec * 1000
    setEndsAt(t + ms)
    setNow(t)
    setStatus('running')
  }

  function pause() {
    if (status !== 'running') return
    setPausedMs(remainingMsAt(Date.now()))
    setEndsAt(null)
    setStatus('paused')
  }

  /** Avisa quem usa o hook que a fase acabou, se ela chegou a começar. */
  function report(completed: boolean) {
    if (startedAt === null) return
    const t = Date.now()
    const leftSec = completed ? 0 : Math.ceil(remainingMsAt(t) / 1000)
    const actualSec = plannedSec - leftSec
    if (actualSec <= 0) return
    onPhaseEnd({ phase, startedAt, endedAt: t, plannedSec, actualSec, completed })
  }

  function goTo(next: Phase) {
    setPhase(next)
    setStatus('idle')
    setEndsAt(null)
    setStartedAt(null)
  }

  function complete() {
    report(true)
    const count = phase === 'focus' ? completedFocus + 1 : completedFocus
    setCompletedFocus(count)
    goTo(nextPhase(phase, count, settings))
  }

  /** Encerra a fase atual sem concluir e vai para a próxima. */
  function skip() {
    report(false)
    goTo(nextPhase(phase, completedFocus, settings))
  }

  /** Volta a fase atual para o início. */
  function reset() {
    report(false)
    goTo(phase)
  }

  /** Troca manualmente de fase (abas Foco / Pausa curta / Pausa longa). */
  function selectPhase(next: Phase) {
    report(false)
    goTo(next)
  }

  // Guarda sempre a versão mais nova de `complete`, para o alarme não usar estado antigo.
  const completeRef = useRef(complete)
  useEffect(() => {
    completeRef.current = complete
  })

  useEffect(() => {
    if (status !== 'running' || endsAt === null) return
    // O intervalo só atualiza o relógio da tela; quem encerra a fase é o alarme.
    const tick = setInterval(() => setNow(Date.now()), 250)
    const cancel = scheduleAlarm(Math.max(0, endsAt - Date.now()), () => completeRef.current())
    // A função retornada roda quando pausa, reseta ou o componente sai da tela.
    return () => {
      clearInterval(tick)
      cancel()
    }
  }, [status, endsAt])

  return { phase, status, remainingSec, totalSec, completedFocus, start, pause, skip, reset, selectPhase }
}

/** `ReturnType` extrai o tipo do que a função retorna. Útil para tipar props. */
export type Timer = ReturnType<typeof useTimer>
