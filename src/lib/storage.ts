import type { Session, Settings } from '../types'

export const DEFAULT_SETTINGS: Settings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  cyclesUntilLongBreak: 4,
  soundEnabled: true,
  volume: 0.6,
}

/**
 * Tudo que o app precisa para salvar e ler dados.
 * Os componentes só conhecem esta interface. Hoje ela usa o localStorage;
 * no futuro dá para criar outra implementação que fale com um servidor
 * sem mexer nas telas. Por isso os métodos já retornam Promise.
 */
export interface Repository {
  getSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
  listSessions(): Promise<Session[]>
  addSession(session: Session): Promise<void>
  /** `Partial<Pick<...>>` = um objeto com só alguns campos de Session, todos opcionais. */
  updateSession(id: string, changes: Partial<Pick<Session, 'name'>>): Promise<void>
  deleteSession(id: string): Promise<void>
  clearSessions(): Promise<void>
}

const KEYS = {
  settings: 'pomodoro:v1:settings',
  sessions: 'pomodoro:v1:sessions',
}

// `<T>` é um "genérico": a função serve para qualquer tipo, e quem chama diz qual.
function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function createLocalStorageRepository(): Repository {
  const readSessions = () => readJson<Session[]>(KEYS.sessions, [])

  return {
    async getSettings() {
      // Mescla com os padrões para cobrir campos novos que não existiam quando foi salvo.
      return { ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(KEYS.settings, {}) }
    },
    async saveSettings(settings) {
      writeJson(KEYS.settings, settings)
    },
    async listSessions() {
      return readSessions().sort((a, b) => b.startedAt - a.startedAt)
    },
    async addSession(session) {
      writeJson(KEYS.sessions, [...readSessions(), session])
    },
    async updateSession(id, changes) {
      writeJson(
        KEYS.sessions,
        readSessions().map((s) => (s.id === id ? { ...s, ...changes } : s)),
      )
    },
    async deleteSession(id) {
      writeJson(KEYS.sessions, readSessions().filter((s) => s.id !== id))
    },
    async clearSessions() {
      writeJson(KEYS.sessions, [])
    },
  }
}

/** Instância usada pelo app. Para trocar de armazenamento, troque só esta linha. */
export const repository: Repository = createLocalStorageRepository()
