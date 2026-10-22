export type MajorId =
  | 'cs'
  | 'econ'
  | 'nursing'
  | 'law'
  | 'stats'
  | 'business'
  | 'psych'
  | 'polisci'
  | 'agric'
  | 'comms'

export type Level = 100 | 200 | 300 | 400

export interface Major {
  id: MajorId
  name: string
  short: string
  color: string
  tint: string
  aliases: string[]
  /** Used by the assistant when drafting cover letters. */
  courses: string
  skills: string
}

export const MAJORS: Major[] = [
  {
    id: 'cs', name: 'Computer Science', short: 'CS', color: '#4f46e5', tint: '#eef2ff',
    aliases: ['computer science', 'cs', 'computing', 'software', 'programming', 'developer'],
    courses: 'data structures, databases and software engineering',
    skills: 'writing clean, tested code and working through problems with a team',
  },
  {
    id: 'econ', name: 'Economics', short: 'Econ', color: '#b45309', tint: '#fef3c7',
    aliases: ['economics', 'econ', 'economist'],
    courses: 'microeconomics, econometrics and development economics',
    skills: 'reading data carefully and explaining what it means for real people',
  },
  {
    id: 'nursing', name: 'Nursing', short: 'Nursing', color: '#0e7490', tint: '#ecfeff',
    aliases: ['nursing', 'nurse', 'nurses', 'midwifery'],
    courses: 'anatomy, community health nursing and clinical practice',
    skills: 'calm, patient-centred care and accurate record keeping',
  },
  {
    id: 'law', name: 'Law', short: 'Law', color: '#b91c1c', tint: '#fee2e2',
    aliases: ['law', 'legal', 'llb', 'lawyer'],
    courses: 'constitutional law, contract law and legal research and writing',
    skills: 'careful legal research and clear, persuasive writing',
  },
  {
    id: 'stats', name: 'Statistics', short: 'Stats', color: '#15803d', tint: '#dcfce7',
    aliases: ['statistics', 'stats', 'statistic', 'actuarial', 'data science', 'data analysis'],
    courses: 'probability, regression analysis and statistical computing in R and Python',
    skills: 'cleaning messy data and turning it into clear, honest insights',
  },
  {
    id: 'business', name: 'Business Administration', short: 'Business', color: '#334155', tint: '#f1f5f9',
    aliases: ['business administration', 'business', 'admin', 'marketing', 'accounting', 'finance', 'management'],
    courses: 'marketing, financial accounting and operations management',
    skills: 'organising work, analysing numbers and communicating with customers',
  },
  {
    id: 'psych', name: 'Psychology', short: 'Psych', color: '#be185d', tint: '#fce7f3',
    aliases: ['psychology', 'psych', 'psychologist'],
    courses: 'developmental psychology, research methods and counselling',
    skills: 'active listening, research design and empathetic communication',
  },
  {
    id: 'polisci', name: 'Political Science', short: 'Pol Sci', color: '#1d4ed8', tint: '#dbeafe',
    aliases: ['political science', 'politics', 'polsci', 'pol sci', 'governance', 'public policy'],
    courses: 'comparative politics, public policy and research methods',
    skills: 'policy analysis, structured writing and public speaking',
  },
  {
    id: 'agric', name: 'Agriculture', short: 'Agric', color: '#4d7c0f', tint: '#ecfccb',
    aliases: ['agriculture', 'agric', 'agricultural', 'farming', 'agribusiness', 'agronomy'],
    courses: 'crop science, agricultural economics and extension methods',
    skills: 'hands-on fieldwork and working closely with farming communities',
  },
  {
    id: 'comms', name: 'Communication Studies', short: 'Comms', color: '#c2410c', tint: '#ffedd5',
    aliases: ['communication studies', 'communication', 'communications', 'comms', 'journalism', 'media'],
    courses: 'journalism, public relations and digital media production',
    skills: 'storytelling, writing to deadline and producing content people share',
  },
]

export const LEVELS: Level[] = [100, 200, 300, 400]

export const majorById = (id: MajorId) => MAJORS.find(m => m.id === id)!
