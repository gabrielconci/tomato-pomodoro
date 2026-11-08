import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, repository } from '../lib/storage'
import type { Settings } from '../types'

export function useSettings() {
  // `useState<Settings>` diz ao TypeScript o tipo do estado.
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  useEffect(() => {
    void repository.getSettings().then(setSettings)
  }, [])

  function save(next: Settings) {
    setSettings(next)
    void repository.saveSettings(next)
  }

  return { settings, save }
}
