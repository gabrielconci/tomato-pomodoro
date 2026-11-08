import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'pomodoro:v1:theme'

/** Tema do site. Começa escuro e lembra a escolha do usuário. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    // Coloca ou tira a classe "dark" da tag <html>; o `dark:` do Tailwind depende dela.
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // sem armazenamento disponível; o tema vale só até fechar a página
    }
  }, [theme])

  function toggle() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggle }
}
