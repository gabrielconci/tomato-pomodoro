import type { Timer } from '../hooks/useTimer'
import { formatTime, PHASE_LABELS } from '../lib/timer'
import type { Phase } from '../types'
import { EditableText } from './EditableText'
import { PHASE_STYLES } from './phaseStyles'

interface TimerViewProps {
  timer: Timer
  cyclesUntilLongBreak: number
  sessionName: string
  onRename: (name: string) => void
  onStart: () => void
  notificationsBlocked: boolean
}

const PHASES: Phase[] = ['focus', 'shortBreak', 'longBreak']
const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TimerView({ timer, cyclesUntilLongBreak, sessionName, onRename, onStart, notificationsBlocked }: TimerViewProps) {
  const style = PHASE_STYLES[timer.phase]
  const progress = timer.totalSec > 0 ? 1 - timer.remainingSec / timer.totalSec : 0
  // Posição dentro do ciclo atual, ex.: foco 2 de 4.
  const cyclePosition = (timer.completedFocus % cyclesUntilLongBreak) + (timer.phase === 'focus' ? 1 : 0)

  return (
    <section className="flex flex-col items-center gap-6">
      <div className="w-full max-w-sm text-center">
        <p className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase">Sessão</p>
        <EditableText value={sessionName} onSave={onRename} placeholder="Dê um nome (ex.: Estudar Roma Antiga)" className="text-lg font-semibold" />
      </div>

      {/* Abas de fase */}
      <div className="flex gap-1 rounded-full bg-slate-200/70 p-1 dark:bg-slate-800">
        {PHASES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => p !== timer.phase && timer.selectPhase(p)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
              p === timer.phase ? 'bg-white shadow dark:bg-slate-950' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Anel de progresso em SVG */}
      <div className="relative aspect-square w-full max-w-72">
        <svg viewBox="0 0 280 280" className="h-full w-full -rotate-90">
          <circle cx="140" cy="140" r={RADIUS} fill="none" strokeWidth="12" className="stroke-slate-200 dark:stroke-slate-800" />
          <circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className={`${style.ring} transition-[stroke-dashoffset] duration-300`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-6xl font-bold tabular-nums sm:text-7xl">{formatTime(timer.remainingSec)}</span>
          <span className={`mt-2 text-sm font-medium ${style.text}`}>
            {PHASE_LABELS[timer.phase]}
            {timer.status === 'paused' && ' · pausado'}
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={timer.reset}
          disabled={timer.status === 'idle'}
          title="Reiniciar esta fase"
          className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reiniciar
        </button>
        <button
          type="button"
          onClick={timer.status === 'running' ? timer.pause : onStart}
          className={`min-w-36 rounded-full px-8 py-3 text-lg font-semibold text-white shadow-lg transition active:scale-95 ${style.bg}`}
        >
          {timer.status === 'running' ? 'Pausar' : timer.status === 'paused' ? 'Continuar' : 'Iniciar'}
        </button>
        <button
          type="button"
          onClick={timer.skip}
          title="Pular para a próxima fase"
          className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Pular
        </button>
      </div>

      <p className="text-sm text-slate-500">
        Foco {Math.min(cyclePosition, cyclesUntilLongBreak) || cyclesUntilLongBreak} de {cyclesUntilLongBreak} até a pausa longa
      </p>

      {notificationsBlocked && (
        <p className="max-w-sm rounded-lg bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-700 dark:text-amber-400">
          As notificações estão bloqueadas neste navegador. O aviso sonoro continua funcionando. Para ativar, libere as notificações nas configurações do site.
        </p>
      )}
    </section>
  )
}
