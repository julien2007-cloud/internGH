import { useEffect, useState } from 'react'

/** useState that survives reloads. Falls back to memory when storage is blocked. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable (private mode); keep the in-memory value
    }
  }, [key, value])
  // Pick up changes made in other tabs (e.g. an application sent from the apply page).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return
      try {
        if (e.newValue) setValue(JSON.parse(e.newValue) as T)
      } catch {
        // ignore malformed values
      }
    }
    addEventListener('storage', onStorage)
    return () => removeEventListener('storage', onStorage)
  }, [key])
  return [value, setValue] as const
}
