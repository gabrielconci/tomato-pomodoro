// Som (Web Audio API) e notificações do navegador.

let audioCtx: AudioContext | null = null

/**
 * O navegador só deixa tocar som depois de um clique do usuário.
 * Chamamos isto no botão "Iniciar" para liberar o áudio para depois.
 */
export function unlockAudio(): void {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') void audioCtx.resume()
}

/** Toca três bipes curtos, gerados na hora (sem arquivo de áudio). */
export function playBeep(volume: number): void {
  unlockAudio()
  const ctx = audioCtx!
  const start = ctx.currentTime + 0.05
  for (let i = 0; i < 3; i++) {
    const t = start + i * 0.35
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    // Envelope: sobe rápido e desce suave, para não estalar.
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.3)
  }
}

export function notificationsSupported(): boolean {
  return typeof Notification !== 'undefined'
}

/** Pede permissão uma vez. Retorna o estado final. */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported'
  if (Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Notification.permission
}

export function notify(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  const n = new Notification(title, { body, icon: '/favicon.svg', tag: 'pomodoro' })
  // Clicar na notificação traz a aba do timer para frente.
  n.onclick = () => {
    window.focus()
    n.close()
  }
}
