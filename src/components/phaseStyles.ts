import type { Phase } from '../types'

// Dica de Tailwind: as classes precisam aparecer escritas por inteiro no código.
// Montar nomes como `bg-${cor}-500` não funciona, porque o Tailwind só gera CSS
// para as classes que encontra no texto dos arquivos.
export const PHASE_STYLES: Record<Phase, { text: string; bg: string; ring: string; soft: string }> = {
  focus: {
    text: 'text-rose-500',
    bg: 'bg-rose-500 hover:bg-rose-600',
    ring: 'stroke-rose-500',
    soft: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  shortBreak: {
    text: 'text-emerald-500',
    bg: 'bg-emerald-500 hover:bg-emerald-600',
    ring: 'stroke-emerald-500',
    soft: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  longBreak: {
    text: 'text-sky-500',
    bg: 'bg-sky-500 hover:bg-sky-600',
    ring: 'stroke-sky-500',
    soft: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
}
