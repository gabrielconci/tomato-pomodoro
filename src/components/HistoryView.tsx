import { dayKey } from '../lib/stats'
import { formatTime } from '../lib/timer'
import type { Session } from '../types'
import { EditableText } from './EditableText'

interface HistoryViewProps {
  sessions: Session[]
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onClear: () => void
}

function formatDayTitle(key: string): string {
  const today = dayKey(Date.now())
  const yesterday = dayKey(Date.now() - 24 * 60 * 60 * 1000)
  if (key === today) return 'Hoje'
  if (key === yesterday) return 'Ontem'
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function HistoryView({ sessions, onRename, onDelete, onClear }: HistoryViewProps) {
  if (sessions.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p className="text-4xl">🍅</p>
        <p className="mt-3">Nenhuma sessão ainda. Conclua um foco e ele aparece aqui.</p>
      </div>
    )
  }

  // Agrupa por dia. A lista já vem da mais nova para a mais antiga.
  const groups = new Map<string, Session[]>()
  for (const s of sessions) {
    const key = dayKey(s.startedAt)
    groups.set(key, [...(groups.get(key) ?? []), s])
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Histórico</h2>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Apagar todo o histórico? Isso não pode ser desfeito.')) onClear()
          }}
          className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
        >
          Limpar tudo
        </button>
      </div>

      {[...groups.entries()].map(([key, list]) => (
        <div key={key}>
          <h3 className="mb-2 text-sm font-medium text-slate-500 first-letter:uppercase">{formatDayTitle(key)}</h3>
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {list.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <EditableText value={s.name} onSave={(name) => onRename(s.id, name)} className="font-medium" />
                  <p className="px-2 text-xs text-slate-500">
                    {formatClock(s.startedAt)}–{formatClock(s.endedAt)} · {formatTime(s.actualSec)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.completed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {s.completed ? 'Concluído' : 'Interrompido'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Apagar esta sessão do histórico?')) onDelete(s.id)
                  }}
                  title="Apagar"
                  aria-label="Apagar sessão"
                  className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-500"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
