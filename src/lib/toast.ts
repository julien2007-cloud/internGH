export interface ToastItem {
  id: number
  text: string
}

type Listener = (t: ToastItem) => void

const listeners = new Set<Listener>()
let nextId = 1

export function toast(text: string) {
  const t = { id: nextId++, text }
  listeners.forEach(l => l(t))
}

export function onToast(l: Listener) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
