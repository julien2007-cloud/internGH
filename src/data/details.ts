import type { Opportunity, OppType } from './opportunities'

export type WorkMode = 'On-site' | 'Remote' | 'Hybrid'

export interface OppDetails {
  /** "What you'll do" bullets. */
  does: string[]
  about: string
  start: string
  schedule: string
  mode: WorkMode
  openings: number
}

export interface FullDetails extends OppDetails {
  documents: string[]
  selection: string[]
}

// Fictional demo content, keyed by opportunity id.
const DETAILS: Record<string, OppDetails> = {
  'nkosuo-swe': {
    does: ['Build and test new screens in the Nkosuo mobile money app', 'Fix bugs reported by customers and write automated tests', 'Join daily stand-ups and code reviews with senior engineers', 'Ship one feature end to end and demo it to the company'],
    about: 'Nkosuo Tech builds mobile money and savings tools for market traders and small businesses across Ghana.',
    start: 'June 2027 (long vacation)', schedule: 'Full-time, Mon–Fri, 8am–5pm', mode: 'Hybrid', openings: 6,
  },
  'kente-design': {
    does: ['Design new screens for the student and teacher apps in Figma', 'Run short interviews with SHS students to test designs', 'Turn feedback into improved prototypes each week', 'Help keep the design system tidy and consistent'],
    about: 'Kente Labs makes learning apps used in senior high schools across Ghana.',
    start: 'January 2027', schedule: 'Part-time, 20 hours a week, flexible', mode: 'Remote', openings: 3,
  },
  'ridge-nursing': {
    does: ['Assist registered nurses with patient care on the wards', 'Take and record vital signs accurately', 'Support patient education in the maternity unit', 'Attend weekly teaching sessions with the nurse educator'],
    about: 'Ridge Medical Centre is a busy general hospital serving the Greater Accra Region.',
    start: 'December 2026', schedule: 'Shifts, 5 days a week (day shifts only)', mode: 'On-site', openings: 20,
  },
  'volta-health': {
    does: ['Learn how to run blood pressure and blood sugar screenings', 'Practise giving short health talks in local languages', 'Join a supervised outreach visit to a nearby community'],
    about: 'Volta Health Trust runs community health programmes in rural parts of the Volta Region.',
    start: '14 November 2026', schedule: 'Saturday and Sunday, 9am–4pm', mode: 'On-site', openings: 40,
  },
  'sika-econ': {
    does: ['Track inflation, exchange rate and interest rate data each week', 'Build Excel models of household spending', 'Write short research notes for investment clients', 'Present one research piece to the investment committee'],
    about: 'Sika Capital is an Accra-based investment firm managing pension and mutual funds.',
    start: 'February 2027', schedule: 'Full-time, Mon–Fri, 8:30am–5pm', mode: 'On-site', openings: 2,
  },
  'bloom-fi': {
    does: ['Survey market traders about how they save and borrow', 'Help design and test a new daily savings product', 'Enter and clean survey data in Excel', 'Share findings with the product team every two weeks'],
    about: 'Bloom Microfinance offers small loans and savings accounts to traders in the Ashanti Region.',
    start: 'January 2027', schedule: 'Full-time, Mon–Fri, with some market days', mode: 'On-site', openings: 4,
  },
  datasense: {
    does: ['Write SQL queries to answer real client questions', 'Build dashboards in Looker Studio and Power BI', 'Clean and analyse survey data in R or Python', 'Present a final project to a client'],
    about: 'DataSense Ghana is a data consultancy working with NGOs, banks and government agencies.',
    start: 'December 2026', schedule: 'Part-time, about 10 hours a week, live sessions Tue and Thu evenings', mode: 'Remote', openings: 25,
  },
  'gpl-stats': {
    does: ['Clean and analyse district survey data on schools and clinics', 'Make clear charts for policy briefs', 'Check numbers in reports before they are published', 'Co-author one short policy brief'],
    about: 'Ghana Policy Lab is an independent think tank researching education and health policy.',
    start: 'January 2027', schedule: 'Full-time, Mon–Fri, 9am–5pm', mode: 'Hybrid', openings: 3,
  },
  'adom-legal': {
    does: ['Research case law and statutes for commercial disputes', 'Draft legal memos and first drafts of letters', 'Attend court sittings and take notes', 'Help organise case files and evidence bundles'],
    about: 'Adom & Partners is a commercial law firm advising banks, telcos and start-ups.',
    start: 'June 2027 (long vacation)', schedule: 'Full-time, Mon–Fri, 8am–5pm', mode: 'On-site', openings: 4,
  },
  'alc-probono': {
    does: ['Meet clients with a supervising lawyer and take notes', 'Explain tenancy and employment rights in plain language', 'Draft simple letters and complaint forms', 'Keep client files organised and confidential'],
    about: 'Accra Law Clinic gives free legal help to low-income residents of Accra.',
    start: 'January 2027', schedule: 'Two afternoons a week (Tue and Thu, 2pm–5pm)', mode: 'On-site', openings: 12,
  },
  'stats-bootcamp': {
    does: ['Clean a messy real-world dataset step by step', 'Make charts in R (ggplot2) and Python (matplotlib)', 'Run and interpret a regression', 'Present a mini project on the final day'],
    about: 'Run by faculty of the Department of Statistics & Actuarial Science, University of Ghana.',
    start: '30 November 2026', schedule: 'Mon–Fri, 9am–1pm', mode: 'On-site', openings: 60,
  },
  'akuafo-agri': {
    does: ['Visit farmer groups to train them on grain storage', 'Record harvest and sales data on a tablet', 'Help connect farmers with buyers in Accra', 'Write a short end-of-internship report'],
    about: 'Akuafo Farms Collective is a cooperative of over 800 smallholder farmers in the Northern Region.',
    start: 'June 2027 (long vacation)', schedule: 'Full-time, Mon–Sat mornings in the field', mode: 'On-site', openings: 8,
  },
  greenroot: {
    does: ['Process satellite and weather data in Python', 'Build simple models to predict maize yields', 'Turn model results into SMS advice for farmers', 'Join weekly calls with agronomists'],
    about: 'GreenRoot Ghana builds climate and data tools for farmers.',
    start: 'February 2027', schedule: 'Full-time, flexible hours', mode: 'Remote', openings: 2,
  },
  mindwell: {
    does: ['Support peer-counselling clubs in Accra secondary schools', 'Help run mental health awareness sessions', 'Keep confidential session notes under supervision', 'Attend weekly supervision with a clinical psychologist'],
    about: 'MindWell Africa runs youth mental health programmes in schools and communities.',
    start: 'January 2027', schedule: 'Three days a week, 9am–3pm', mode: 'On-site', openings: 6,
  },
  'osu-people': {
    does: ['Screen CVs and schedule interviews', 'Help run onboarding days for new staff', 'Update staff records and training logs', 'Plan a staff wellbeing activity'],
    about: 'Osu Hospitality Group runs three hotels and restaurants in Osu, Accra.',
    start: 'January 2027', schedule: 'Full-time, Mon–Fri, 9am–5pm', mode: 'On-site', openings: 2,
  },
  'cdf-fellow': {
    does: ['Research bills before Parliament', 'Write short briefing notes for committee members', 'Attend committee sittings and summarise debates', 'Help organise public forums on new laws'],
    about: 'The Centre for Democratic Futures is a non-partisan organisation that supports Parliament with research.',
    start: 'March 2027', schedule: 'Full-time, Mon–Fri, with some sitting days', mode: 'On-site', openings: 5,
  },
  'aypf-workshop': {
    does: ['Learn how a policy proposal is structured', 'Work in a small team on a youth issue you care about', 'Pitch your proposal to a panel of policymakers'],
    about: 'Africa Youth Policy Forum trains young people across the continent to shape public policy.',
    start: '9 November 2026', schedule: 'Three evenings, 6pm–8pm', mode: 'Remote', openings: 100,
  },
  'harmattan-news': {
    does: ['Pitch and report campus and city stories', 'Write online articles and short radio scripts', 'Record vox pops and interviews', 'Fact-check stories before publication'],
    about: 'Harmattan Media runs a radio station and news website covering Accra and national politics.',
    start: 'January 2027', schedule: 'Full-time, rotating shifts', mode: 'On-site', openings: 5,
  },
  'jollof-digital': {
    does: ['Plan weekly content calendars for client brands', 'Shoot and edit short videos for TikTok and Instagram', 'Write captions and reply to comments', 'Report on what posts performed best'],
    about: 'Jollof Digital Studio is a social media agency for Ghanaian food and fashion brands.',
    start: 'December 2026', schedule: 'Part-time, 25 hours a week', mode: 'Remote', openings: 4,
  },
  'meridian-ba': {
    does: ['Rotate across three client projects during the year', 'Build Excel and PowerPoint analyses for clients', 'Interview client staff and summarise findings', 'Present recommendations alongside senior consultants'],
    about: 'Meridian Consulting Accra advises banks, telcos and government agencies on strategy.',
    start: 'September 2027 (after graduation)', schedule: 'Full-time, Mon–Fri', mode: 'Hybrid', openings: 8,
  },
  'lih-bootcamp': {
    does: ['Validate your business idea with real customers', 'Build a simple prototype or pilot', 'Learn pricing, marketing and basic finance', 'Pitch on demo day for seed grants'],
    about: 'Legon Innovation Hub supports student founders at the University of Ghana.',
    start: '7 December 2026', schedule: 'Tuesday and Thursday evenings, 5pm–8pm', mode: 'On-site', openings: 15,
  },
  'shieldnet-cyber': {
    does: ['Monitor security alerts in a live operations centre', 'Investigate suspicious logins and phishing emails', 'Write short incident reports', 'Prepare for an industry certification exam'],
    about: 'ShieldNet West Africa protects banks and fintechs from cyber attacks.',
    start: 'January 2027', schedule: 'Full-time, day shifts', mode: 'On-site', openings: 10,
  },
  'ug-ml-ra': {
    does: ['Collect and clean Twi and Ga speech recordings', 'Label audio data and check quality', 'Train and evaluate speech models in Python', 'Help write up results for a research paper'],
    about: 'A research project in the Department of Computer Science, University of Ghana.',
    start: 'January 2027', schedule: 'Part-time, 12 hours a week', mode: 'On-site', openings: 2,
  },
  'lighthouse-paeds': {
    does: ['Care for children on the paediatric and neonatal wards', 'Assist with feeding, medication rounds and monitoring', 'Support parents with health education', 'Attend structured teaching every week'],
    about: "Lighthouse Children's Hospital is a specialist children's hospital in Accra.",
    start: 'February 2027', schedule: 'Shifts, 5 days a week', mode: 'On-site', openings: 6,
  },
  'moot-court': {
    does: ['Learn to research and write a moot memorial', 'Practise oral arguments in front of judges', 'Get feedback from alumni coaches', 'Compete for a place on the international team'],
    about: 'The UG School of Law Moot Society trains students for national and international moot courts.',
    start: '14 November 2026', schedule: 'Four Saturdays, 9am–3pm', mode: 'On-site', openings: 30,
  },
  'waei-school': {
    does: ['Attend lectures on how central banks set interest rates', 'Play a monetary policy simulation game in teams', 'Hear from practising economists', 'Present a policy recommendation on the final day'],
    about: 'The West Africa Economics Institute trains economists across the region.',
    start: '7 December 2026', schedule: 'Mon–Fri, 9am–4pm for two weeks', mode: 'On-site', openings: 40,
  },
  'tema-logistics': {
    does: ['Track container movements through the port', 'Analyse delays and suggest fixes', 'Prepare weekly operations reports', 'Visit port terminals with the operations team'],
    about: 'Tema Port Logistics handles shipping and clearing for importers and exporters.',
    start: 'January 2027', schedule: 'Full-time, Mon–Fri, 8am–5pm', mode: 'On-site', openings: 3,
  },
  'child-lab': {
    does: ['Run play-based assessments with young children', 'Explain the study to parents and collect consent', 'Code video recordings for analysis', 'Enter and check data'],
    about: 'Legon Child Lab studies how children in Ghana learn and develop.',
    start: 'January 2027', schedule: 'Part-time, 12 hours a week', mode: 'On-site', openings: 4,
  },
  'afro-audio': {
    does: ['Plan your podcast episode and write a short script', 'Record clean audio on your phone', 'Edit with free tools', 'Publish your episode on the collective network'],
    about: 'Afrobeat Audio Collective is a network of Ghanaian podcasters and audio storytellers.',
    start: '16 November 2026', schedule: 'Four evenings, 7pm–9pm', mode: 'Remote', openings: 50,
  },
  'nfn-extension': {
    does: ['Teach improved planting methods to farmer groups', 'Demonstrate safe grain storage', 'Collect feedback from farmers', 'Help organise a farmer field day'],
    about: 'Northern Farmers Network links over 5,000 farmers to training and markets.',
    start: 'June 2027 (long vacation)', schedule: 'Full-time, Mon–Fri in the field', mode: 'On-site', openings: 15,
  },
  'survey-enum': {
    does: ['Interview households using tablets', 'Check your data for errors at the end of each day', 'Help clean the final dataset', 'Write a short field report'],
    about: 'Ghana Insights Research runs surveys for NGOs, government and universities.',
    start: 'December 2026', schedule: 'Full-time, Mon–Fri in the field', mode: 'On-site', openings: 15,
  },
  'actuarial-summer': {
    does: ['Help build life insurance pricing models in Excel', 'Check claims data for patterns', 'Shadow qualified actuaries in meetings', 'Present a mini pricing project at the end'],
    about: 'Gold Coast Assurance is a life and health insurance company headquartered in Accra.',
    start: 'June 2027 (long vacation)', schedule: 'Full-time, Mon–Fri, 8:30am–5pm', mode: 'Hybrid', openings: 4,
  },
  'data-viz-workshop': {
    does: ['Learn which chart fits which question', 'Redesign a messy chart into a clear one', 'Write a short data story from a public dataset'],
    about: 'Open Data Ghana is a volunteer community that promotes open, usable public data.',
    start: '24 October 2026', schedule: 'Two evenings, 6pm–8pm', mode: 'Remote', openings: 80,
  },
  'nss-it-support': {
    does: ['Set up laptops, printers and user accounts', 'Fix network and Wi-Fi problems', 'Help staff with day-to-day IT issues', 'Keep the equipment inventory up to date'],
    about: 'Achimota Digital Services provides IT support to schools and small businesses in Accra.',
    start: 'June 2027 (long vacation)', schedule: 'Full-time, Mon–Fri, 8am–4pm', mode: 'On-site', openings: 5,
  },
}

const DOCUMENTS: Record<OppType, string[]> = {
  Internship: ['CV (one page)', 'Short cover letter', 'Latest transcript or results slip'],
  Fellowship: ['CV', 'Motivation statement (about 500 words)', 'Transcript', 'Two referees'],
  Workshop: ['Short registration form'],
  Training: ['CV', 'One-paragraph motivation'],
}

const SELECTION: Record<OppType, string[]> = {
  Internship: ['Application review', 'Short phone or video interview', 'Offer within 2 weeks of the deadline'],
  Fellowship: ['Application review', 'Written task or case study', 'Panel interview', 'Final offer'],
  Workshop: ['Registration review', 'Confirmation email with joining details'],
  Training: ['Application review', 'Short online aptitude test', 'Welcome session'],
}

const FALLBACK: OppDetails = {
  does: [], about: '', start: 'To be confirmed', schedule: 'To be confirmed', mode: 'On-site', openings: 1,
}

/** Adds details for a listing posted at runtime (see posted.ts). */
export function registerDetails(id: string, d: OppDetails) {
  DETAILS[id] = d
}

export function detailsFor(o: Opportunity): FullDetails {
  const d = DETAILS[o.id] ?? { ...FALLBACK, mode: o.remote ? 'Remote' : 'On-site' }
  return { ...d, documents: DOCUMENTS[o.type], selection: SELECTION[o.type] }
}
