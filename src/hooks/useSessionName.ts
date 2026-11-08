import { useEffect, useState } from 'react'

const KEY = 'pomodoro:v1:currentName'

/** Nome da sessão atual. Fica salvo para não sumir ao recarregar a página. */
export function useSessionName() {
  // Passar uma função para o useState faz a leitura acontecer só na primeira renderização.
  const [name, setName] = useState<string>(() => {
    try {
      return localStorage.getItem(KEY) ?? ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, name)
    } catch {
      // sem armazenamento disponível (ex.: janela privada); segue só em memória
    }
  }, [name])

  return [name, setName] as const
}
