// Agenda uma função para rodar daqui a `delayMs`, usando o worker quando disponível.

let worker: Worker | null = null
let nextId = 1
const callbacks = new Map<number, () => void>()

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  if (!worker) {
    // Sintaxe que o Vite reconhece para empacotar o worker.
    worker = new Worker(new URL('./alarm.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<{ type: 'done'; id: number }>) => {
      const cb = callbacks.get(event.data.id)
      callbacks.delete(event.data.id)
      cb?.() // `?.` só chama se cb existir
    }
  }
  return worker
}

/** Retorna uma função que cancela o alarme. */
export function scheduleAlarm(delayMs: number, callback: () => void): () => void {
  const w = getWorker()
  if (!w) {
    const handle = setTimeout(callback, delayMs)
    return () => clearTimeout(handle)
  }
  const id = nextId++
  callbacks.set(id, callback)
  w.postMessage({ type: 'start', id, delayMs })
  return () => {
    callbacks.delete(id)
    w.postMessage({ type: 'cancel', id })
  }
}
