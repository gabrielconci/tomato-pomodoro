import { useState, type FormEvent } from 'react'
import { playBeep } from '../lib/alerts'
import { DEFAULT_SETTINGS } from '../lib/storage'
import type { Settings } from '../types'

interface SettingsModalProps {
  settings: Settings
  onSave: (settings: Settings) => void
  onClose: () => void
}

// Só os campos numéricos que viram inputs. Assim `draft[f.key]` é sempre um number.
type NumberKey = 'focusMin' | 'shortBreakMin' | 'longBreakMin' | 'cyclesUntilLongBreak'

const NUMBER_FIELDS: { key: NumberKey; label: string; min: number; max: number }[] = [
  { key: 'focusMin', label: 'Foco (min)', min: 1, max: 180 },
  { key: 'shortBreakMin', label: 'Pausa curta (min)', min: 1, max: 60 },
  { key: 'longBreakMin', label: 'Pausa longa (min)', min: 1, max: 120 },
  { key: 'cyclesUntilLongBreak', label: 'Focos até a pausa longa', min: 1, max: 12 },
]

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  // Rascunho local: só vale quando clicar em Salvar.
  const [draft, setDraft] = useState<Settings>(settings)

  // Genérico: `K` é o nome do campo, e `Settings[K]` é o tipo desse campo.
  // Assim update('soundEnabled', 5) dá erro, porque soundEnabled é boolean.
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Garante números inteiros dentro dos limites.
    const clean: Settings = { ...draft }
    for (const f of NUMBER_FIELDS) {
      const n = clean[f.key]
      clean[f.key] = Number.isFinite(n) ? Math.min(f.max, Math.max(f.min, Math.round(n))) : DEFAULT_SETTINGS[f.key]
    }
    onSave(clean)
    onClose()
  }

  return (
    // Fundo escuro; clicar fora fecha.
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
      >
        <h2 className="text-xl font-semibold">Configurações</h2>

        <div className="grid grid-cols-2 gap-4">
          {NUMBER_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1 text-sm">
              <span className="text-slate-600 dark:text-slate-400">{f.label}</span>
              <input
                type="number"
                min={f.min}
                max={f.max}
                required
                // Campo vazio vira NaN; mostramos vazio em vez de "NaN".
                value={Number.isNaN(draft[f.key]) ? '' : draft[f.key]}
                onChange={(e) => update(f.key, e.target.valueAsNumber)}
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
              />
            </label>
          ))}
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <label className="flex items-center justify-between text-sm">
            <span>Aviso sonoro</span>
            <input
              type="checkbox"
              checked={draft.soundEnabled}
              onChange={(e) => update('soundEnabled', e.target.checked)}
              className="h-5 w-5 accent-rose-500"
            />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <span className="shrink-0">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              disabled={!draft.soundEnabled}
              value={draft.volume}
              onChange={(e) => update('volume', e.target.valueAsNumber)}
              className="w-full accent-rose-500"
            />
            <button
              type="button"
              disabled={!draft.soundEnabled}
              onClick={() => playBeep(draft.volume)}
              className="shrink-0 rounded-md px-2 py-1 text-rose-600 hover:bg-rose-500/10 disabled:opacity-40 dark:text-rose-400"
            >
              Testar
            </button>
          </label>
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_SETTINGS)}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Restaurar padrão
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              Salvar
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">Novas durações valem a partir da próxima fase iniciada.</p>
      </form>
    </div>
  )
}
