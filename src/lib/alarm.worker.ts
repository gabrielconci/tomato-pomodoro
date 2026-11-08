// Web Worker: roda numa thread separada da página.
// Em abas de fundo o Chrome atrasa o setTimeout da página em até 1 minuto,
// mas o de um worker continua pontual. Por isso o fim do timer é agendado aqui.

type Incoming = { type: 'start'; id: number; delayMs: number } | { type: 'cancel'; id: number }

// Sem a lib "WebWorker" no tsconfig, `self` é tipado como Window. Este cast ajusta o tipo.
const scope = self as unknown as {
  postMessage(message: { type: 'done'; id: number }): void
  onmessage: ((event: MessageEvent<Incoming>) => void) | null
}

const timers = new Map<number, ReturnType<typeof setTimeout>>()

scope.onmessage = (event) => {
  const msg = event.data
  if (msg.type === 'start') {
    const handle = setTimeout(() => {
      timers.delete(msg.id)
      scope.postMessage({ type: 'done', id: msg.id })
    }, msg.delayMs)
    timers.set(msg.id, handle)
  } else {
    clearTimeout(timers.get(msg.id))
    timers.delete(msg.id)
  }
}
