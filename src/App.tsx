import { useEffect, useState } from 'react'
import { HistoryView } from './components/HistoryView'
import { SettingsModal } from './components/SettingsModal'
import { StatsView } from './components/StatsView'
import { ThemeToggle } from './components/ThemeToggle'
import { TimerView } from './components/TimerView'
import { useHistory } from './hooks/useHistory'
import { useSessionName } from './hooks/useSessionName'
import { useSettings } from './hooks/useSettings'
import { useTheme } from './hooks/useTheme'
import { useTimer, type PhaseResult } from './hooks/useTimer'
import { notificationsSupported, notify, playBeep, requestNotificationPermission, unlockAudio } from './lib/alerts'
import { formatTime, PHASE_LABELS } from './lib/timer'

type Tab = 'timer' | 'history' | 'stats'

const TABS: { id: Tab; label: string }[] = [
  { id: 'timer', label: 'Timer' },
  { id: 'history', label: 'Histórico' },
  { id: 'stats', label: 'Estatísticas' },
]

export default function App() {
  const { settings, save: saveSettings } = useSettings()
  const history = useHistory()
  const [sessionName, setSessionName] = useSessionName()
  const { theme, toggle: toggleTheme } = useTheme()
  const [tab, setTab] = useState<Tab>('timer')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationsBlocked, setNotificationsBlocked] = useState(
    () => notificationsSupported() && Notification.permission === 'denied',
  )

  function handlePhaseEnd(result: PhaseResult) {
    if (result.completed) {
      if (settings.soundEnabled) playBeep(settings.volume)
      const label = sessionName ? ` · ${sessionName}` : ''
      if (result.phase === 'focus') notify(`Foco concluído${label}`, 'Hora de fazer uma pausa.')
      else notify('Pausa encerrada', 'Bora voltar ao foco!')
    }
    // Só os focos vão para o histórico.
    if (result.phase === 'focus') {
      history.add({ id: crypto.randomUUID(), name: sessionName, ...result })
    }
  }

  // O timer fica no App (e não no TimerView) para continuar rodando ao trocar de aba.
  const timer = useTimer(settings, handlePhaseEnd)

  async function handleStart() {
    unlockAudio() // precisa acontecer dentro do clique
    timer.start()
    const permission = await requestNotificationPermission()
    setNotificationsBlocked(permission === 'denied')
  }

  // Mostra o tempo no título da aba.
  useEffect(() => {
    document.title =
      timer.status === 'idle' ? 'Tomato Pomodoro' : `${formatTime(timer.remainingSec)} · ${PHASE_LABELS[timer.phase]}`
  }, [timer.status, timer.remainingSec, timer.phase])

  return (
    // `dark:` aplica o estilo quando o tema escuro está ativo (classe "dark" no <html>).
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:py-10">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold">🍅 Tomato Pomodoro</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Configurações"
            title="Configurações"
            className="rounded-full p-2 text-xl hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            ⚙️
            </button>
          </div>
        </header>

        <nav className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'border-slate-900 dark:border-slate-100'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main>
          {tab === 'timer' && (
            <TimerView
              timer={timer}
              cyclesUntilLongBreak={settings.cyclesUntilLongBreak}
              sessionName={sessionName}
              onRename={setSessionName}
              onStart={handleStart}
              notificationsBlocked={notificationsBlocked}
            />
          )}
          {tab === 'history' && (
            <HistoryView sessions={history.sessions} onRename={history.rename} onDelete={history.remove} onClear={history.clear} />
          )}
          {tab === 'stats' && <StatsView sessions={history.sessions} />}
        </main>
      </div>

      {settingsOpen && <SettingsModal settings={settings} onSave={saveSettings} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
