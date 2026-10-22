import type { Level, MajorId } from '../data/majors'

export interface User {
  name: string
  email: string
  studentId: string
  major: MajorId
  level: Level
  phone: string
  whatsapp: boolean
}

export const UG_EMAIL = /^[a-z0-9][a-z0-9._-]*@(st\.)?ug\.edu\.gh$/i

/** "kofi.a.mensah@st.ug.edu.gh" -> "Kofi A Mensah" */
export function nameFromEmail(email: string) {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ')
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const firstName = (name: string) => name.split(/\s+/)[0] ?? name
