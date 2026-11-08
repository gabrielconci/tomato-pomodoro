import { summarize, type Totals } from '../lib/stats'
import type { Session } from '../types'

interface StatsViewProps {
  sessions: Session[]
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function StatCard({ title, totals }: { title: string; totals: Totals }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{title}</p>
      <p className="mt-1 text-2xl font-bold">{totals.count} 🍅</p>
      <p className="text-sm text-slate-500">{formatMinutes(totals.minutes)} de foco</p>
    </div>
  )
}

export function StatsView({ sessions }: StatsViewProps) {
  const stats = summarize(sessions)
  const maxDay = Math.max(1, ...stats.last7Days.map((d) => d.minutes))
  const maxName = Math.max(1, ...stats.byName.map((n) => n.minutes))

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Estatísticas</h2>

      {/* grid-cols-1 no celular, 3 colunas a partir de telas "sm" (640px) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard title="Hoje" totals={stats.today} />
        <StatCard title="Últimos 7 dias" totals={stats.last7} />
        <StatCard title="Total" totals={stats.total} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-sm font-medium text-slate-500">Minutos de foco por dia</h3>
        <div className="flex h-40 items-end gap-2">
          {stats.last7Days.map((d) => (
            <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs text-slate-500 tabular-nums">{d.minutes || ''}</span>
              <div
                className="w-full max-w-10 rounded-t-md bg-rose-500"
                // A altura muda com os dados, então vai em `style` e não numa classe.
                style={{ height: `${(d.minutes / maxDay) * 100}%`, minHeight: d.minutes ? 4 : 0 }}
                title={`${d.minutes} min · ${d.count} concluído(s)`}
              />
              <span className="text-xs text-slate-500">{d.label.replace('.', '')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-medium text-slate-500">Tempo por sessão</h3>
        {stats.byName.length === 0 ? (
          <p className="text-sm text-slate-500">Sem dados ainda.</p>
        ) : (
          <ul className="space-y-3">
            {stats.byName.map((n) => (
              <li key={n.name}>
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{n.name}</span>
                  <span className="shrink-0 text-slate-500">
                    {formatMinutes(n.minutes)} · {n.count} 🍅
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-rose-500" style={{ width: `${(n.minutes / maxName) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
