import { useEffect, useState } from 'react'
import { repository } from '../lib/storage'
import type { Session } from '../types'

/** Lista de sessões em memória, sempre sincronizada com o repositório. */
export function useHistory() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    void repository.listSessions().then(setSessions)
  }, [])

  function add(session: Session) {
    setSessions((prev) => [session, ...prev])
    void repository.addSession(session)
  }

  function rename(id: string, name: string) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
    void repository.updateSession(id, { name })
  }

  function remove(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    void repository.deleteSession(id)
  }

  function clear() {
    setSessions([])
    void repository.clearSessions()
  }

  return { sessions, add, rename, remove, clear }
}
