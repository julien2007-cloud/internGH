import type { Level, MajorId } from './majors'

export type OppType = 'Internship' | 'Fellowship' | 'Workshop' | 'Training'
export type Source = 'Partner company' | 'Career office' | 'Department' | 'Alumni network' | 'Job board' | 'Student tip'

export interface Opportunity {
  id: string
  title: string
  org: string
  initials: string
  color: string
  type: OppType
  majors: MajorId[]
  levels: Level[]
  location: string
  remote: boolean
  paid: boolean
  stipend: string
  duration: string
  months: number
  deadline: number
  posted: number
  summary: string
  requirements: string[]
  perks: string[]
  source: Source
  verified: boolean
  featured?: boolean
}

// All listings are fictional demo data. Deadlines are relative to page load so
// the countdowns always look live.
const HOUR = 3_600_000
const DAY = 24 * HOUR
const T0 = Date.now()
const ALL: Level[] = [100, 200, 300, 400]

type Seed = Omit<Opportunity, 'deadline' | 'posted' | 'remote' | 'verified'> & {
  dueIn: number
  postedAgo: number
  verified?: boolean
}

const seed = (s: Seed): Opportunity => {
  const { dueIn, postedAgo, ...rest } = s
  return {
    ...rest,
    remote: s.location === 'Remote',
    verified: s.verified ?? true,
    deadline: T0 + dueIn * DAY,
    posted: T0 - postedAgo * DAY,
  }
}

export const OPPORTUNITIES: Opportunity[] = [
  seed({
    id: 'nkosuo-swe', title: 'Software Engineering Intern', org: 'Nkosuo Tech', initials: 'NT', color: '#4f46e5',
    type: 'Internship', majors: ['cs', 'stats'], levels: [300, 400], location: 'Accra', paid: true,
    stipend: 'GH₵ 1,800 / month', duration: '3 months', months: 3, dueIn: 4.26, postedAgo: 12,
    summary: 'Build mobile money features used by over two million Ghanaians, working alongside senior engineers on a real product team.',
    requirements: ['Comfortable with JavaScript or Python', 'Basic Git and command line', 'Available June to August'],
    perks: ['Monthly stipend', 'Laptop provided', 'One-on-one mentor'],
    source: 'Partner company', featured: true,
  }),
  seed({
    id: 'kente-design', title: 'Product Design Internship', org: 'Kente Labs', initials: 'KL', color: '#db2777',
    type: 'Internship', majors: ['cs', 'comms'], levels: [200, 300, 400], location: 'Remote', paid: true,
    stipend: 'GH₵ 1,200 / month', duration: '3 months', months: 3, dueIn: 15.2, postedAgo: 2,
    summary: 'Design screens for a fast-growing edtech app used in senior high schools across Ghana. Portfolio of class projects is enough.',
    requirements: ['A portfolio (class projects count)', 'Familiar with Figma', 'Curious about how people use apps'],
    perks: ['Fully remote', 'Data bundle allowance', 'Portfolio review'],
    source: 'Partner company',
  }),
  seed({
    id: 'ridge-nursing', title: 'Clinical Nursing Attachment', org: 'Ridge Medical Centre', initials: 'RM', color: '#0891b2',
    type: 'Internship', majors: ['nursing'], levels: [200, 300, 400], location: 'Accra', paid: false,
    stipend: 'Unpaid · meals provided', duration: '8 weeks', months: 2, dueIn: 2.12, postedAgo: 20,
    summary: 'Rotate through the outpatient, maternity and emergency wards under the supervision of registered nurses.',
    requirements: ['Current UG nursing student', 'Up-to-date immunisations', 'Letter from your department'],
    perks: ['Ward rotations', 'Supervisor reference letter', 'Meals on shift'],
    source: 'Career office',
  }),
  seed({
    id: 'volta-health', title: 'Community Health Outreach Workshop', org: 'Volta Health Trust', initials: 'VH', color: '#0d9488',
    type: 'Workshop', majors: ['nursing', 'psych'], levels: ALL, location: 'Ho', paid: false,
    stipend: 'Free · travel covered', duration: '2 days', months: 0.1, dueIn: 1.8, postedAgo: 9,
    summary: 'A hands-on weekend learning how to run health screening and education sessions in rural communities.',
    requirements: ['Any level welcome', 'Interest in community health'],
    perks: ['Certificate of participation', 'Travel to Ho covered'],
    source: 'Student tip',
  }),
  seed({
    id: 'sika-econ', title: 'Economics Research Fellowship', org: 'Sika Capital', initials: 'SC', color: '#ca8a04',
    type: 'Fellowship', majors: ['econ', 'stats'], levels: [400], location: 'Accra', paid: true,
    stipend: 'GH₵ 2,500 / month', duration: '6 months', months: 6, dueIn: 11, postedAgo: 6,
    summary: 'Research inflation, cedi exchange rates and household spending with the investment research team.',
    requirements: ['Final-year Economics or Statistics', 'Strong Excel skills', 'Short writing sample'],
    perks: ['Competitive stipend', 'Published research credit', 'Possible full-time offer'],
    source: 'Partner company', featured: true,
  }),
  seed({
    id: 'bloom-fi', title: 'Financial Inclusion Intern', org: 'Bloom Microfinance', initials: 'BM', color: '#65a30d',
    type: 'Internship', majors: ['econ', 'business'], levels: [300, 400], location: 'Kumasi', paid: true,
    stipend: 'GH₵ 1,000 / month', duration: '3 months', months: 3, dueIn: 7.1, postedAgo: 4,
    summary: 'Help design savings products for market traders and survey customers in Kumasi markets.',
    requirements: ['Comfortable speaking Twi', 'Basic Excel', 'Willing to do fieldwork'],
    perks: ['Stipend plus transport', 'Field experience'],
    source: 'Job board',
  }),
  seed({
    id: 'datasense', title: 'Junior Data Analyst Program', org: 'DataSense Ghana', initials: 'DS', color: '#16a34a',
    type: 'Training', majors: ['stats', 'cs', 'econ'], levels: [200, 300, 400], location: 'Remote', paid: true,
    stipend: 'GH₵ 900 / month', duration: '4 months', months: 4, dueIn: 9.1, postedAgo: 3,
    summary: 'Learn SQL, dashboards and survey analysis on real client projects, with weekly live sessions.',
    requirements: ['Completed an intro statistics course', 'Laptop and stable internet', '10 hours a week'],
    perks: ['Paid while you learn', 'Certificate', 'Remote friendly'],
    source: 'Partner company',
  }),
  seed({
    id: 'gpl-stats', title: 'Policy and Statistics Intern', org: 'Ghana Policy Lab', initials: 'GP', color: '#7c3aed',
    type: 'Internship', majors: ['stats', 'polisci', 'econ'], levels: [200, 300, 400], location: 'Accra', paid: true,
    stipend: 'GH₵ 1,300 / month', duration: '12 weeks', months: 3, dueIn: 5, postedAgo: 8,
    summary: 'Analyse district-level survey data to inform education and health policy briefs.',
    requirements: ['Stata, R or Python', 'Clear writing', 'Interest in public policy'],
    perks: ['Co-author a policy brief', 'Mentorship from researchers'],
    source: 'Alumni network',
  }),
  seed({
    id: 'adom-legal', title: 'Legal Research Intern', org: 'Adom & Partners', initials: 'AP', color: '#b91c1c',
    type: 'Internship', majors: ['law'], levels: [300, 400], location: 'Accra', paid: true,
    stipend: 'GH₵ 1,500 / month', duration: '10 weeks', months: 2.5, dueIn: 6.6, postedAgo: 5,
    summary: 'Support associates with case research, drafting memos and attending court sittings in commercial matters.',
    requirements: ['Third or final-year LLB', 'Strong legal writing', 'Transcript'],
    perks: ['Court attendance', 'Reference letter', 'Stipend'],
    source: 'Partner company',
  }),
  seed({
    id: 'alc-probono', title: 'Pro Bono Clinic Volunteer', org: 'Accra Law Clinic', initials: 'AL', color: '#9a3412',
    type: 'Training', majors: ['law', 'polisci'], levels: [200, 300, 400], location: 'Accra', paid: false,
    stipend: 'Unpaid · transport refund', duration: 'One semester', months: 4, dueIn: 3.3, postedAgo: 14,
    summary: 'Help low-income clients understand their rights in tenancy and employment disputes, supervised by lawyers.',
    requirements: ['Two afternoons a week', 'Interest in access to justice'],
    perks: ['Supervised client work', 'Certificate'],
    source: 'Alumni network',
  }),
  seed({
    id: 'stats-bootcamp', title: 'Applied Statistics Bootcamp (R and Python)', org: 'Dept. of Statistics & Actuarial Science', initials: 'SA', color: '#0f766e',
    type: 'Workshop', majors: ['stats', 'econ', 'psych'], levels: ALL, location: 'Legon campus', paid: false,
    stipend: 'Free', duration: '1 week', months: 0.25, dueIn: 8, postedAgo: 1,
    summary: 'A one-week practical bootcamp on data cleaning, visualisation and regression, run by department faculty.',
    requirements: ['Bring a laptop', 'Open to all levels'],
    perks: ['Certificate', 'Free lunch', 'Project for your CV'],
    source: 'Department',
  }),
  seed({
    id: 'akuafo-agri', title: 'Agribusiness Field Internship', org: 'Akuafo Farms Collective', initials: 'AF', color: '#4d7c0f',
    type: 'Internship', majors: ['agric', 'business'], levels: [200, 300, 400], location: 'Tamale', paid: true,
    stipend: 'GH₵ 800 / month + housing', duration: '3 months', months: 3, dueIn: 13, postedAgo: 7,
    summary: 'Work with smallholder farmers on post-harvest storage and help connect them to buyers in Accra.',
    requirements: ['Comfortable with fieldwork', 'Basic Excel'],
    perks: ['Housing provided', 'Stipend', 'Field certificate'],
    source: 'Career office',
  }),
  seed({
    id: 'greenroot', title: 'AgriTech Data Fellowship', org: 'GreenRoot Ghana', initials: 'GR', color: '#15803d',
    type: 'Fellowship', majors: ['agric', 'cs', 'stats'], levels: [300, 400], location: 'Remote', paid: true,
    stipend: 'GH₵ 1,600 / month', duration: '6 months', months: 6, dueIn: 21, postedAgo: 2,
    summary: 'Use satellite and weather data to help predict maize yields for farmers in the Northern Region.',
    requirements: ['Python or R', 'Interest in agriculture'],
    perks: ['Remote', 'Stipend', 'Conference trip'],
    source: 'Job board',
  }),
  seed({
    id: 'mindwell', title: 'Mental Health Support Intern', org: 'MindWell Africa', initials: 'MW', color: '#0ea5e9',
    type: 'Internship', majors: ['psych', 'nursing'], levels: [300, 400], location: 'Accra', paid: false,
    stipend: 'Unpaid · transport allowance', duration: '10 weeks', months: 2.5, dueIn: 4.9, postedAgo: 10,
    summary: 'Support peer-counselling programmes in Accra secondary schools and help run awareness sessions.',
    requirements: ['Psychology or Nursing student', 'Empathetic communicator'],
    perks: ['Supervised practice hours', 'Training in psychological first aid'],
    source: 'Student tip',
  }),
  seed({
    id: 'osu-people', title: 'People and Culture Intern', org: 'Osu Hospitality Group', initials: 'OH', color: '#e11d48',
    type: 'Internship', majors: ['psych', 'business'], levels: [300, 400], location: 'Accra', paid: true,
    stipend: 'GH₵ 1,100 / month', duration: '3 months', months: 3, dueIn: 18, postedAgo: 3,
    summary: 'Help recruit, onboard and train staff across three hotels and restaurants in Osu.',
    requirements: ['Organised and people-focused', 'Microsoft Office'],
    perks: ['Stipend', 'Staff meals', 'HR certification support'],
    source: 'Partner company',
  }),
  seed({
    id: 'cdf-fellow', title: 'Parliamentary Research Fellowship', org: 'Centre for Democratic Futures', initials: 'CD', color: '#1d4ed8',
    type: 'Fellowship', majors: ['polisci', 'law', 'econ'], levels: [400], location: 'Accra', paid: true,
    stipend: 'GH₵ 2,000 / month', duration: '9 months', months: 9, dueIn: 24, postedAgo: 5,
    summary: 'Research bills and write briefing notes for parliamentary committees during the legislative session.',
    requirements: ['Final-year student', 'Excellent writing', 'Two references'],
    perks: ['Work inside Parliament House', 'Stipend', 'Alumni network'],
    source: 'Career office', featured: true,
  }),
  seed({
    id: 'aypf-workshop', title: 'Youth Policy Workshop', org: 'Africa Youth Policy Forum', initials: 'AY', color: '#6d28d9',
    type: 'Workshop', majors: ['polisci', 'comms', 'econ'], levels: ALL, location: 'Remote', paid: false,
    stipend: 'Free', duration: '3 days', months: 0.1, dueIn: 2.6, postedAgo: 4,
    summary: 'Three online sessions on writing policy proposals, with a chance to pitch to a panel of policymakers.',
    requirements: ['Open to all levels', 'Stable internet for live sessions'],
    perks: ['Certificate', 'Pitch to a real panel'],
    source: 'Job board',
  }),
  seed({
    id: 'harmattan-news', title: 'Newsroom Reporting Intern', org: 'Harmattan Media', initials: 'HM', color: '#ea580c',
    type: 'Internship', majors: ['comms', 'polisci'], levels: [200, 300, 400], location: 'Accra', paid: true,
    stipend: 'GH₵ 700 / month', duration: '3 months', months: 3, dueIn: 10, postedAgo: 6,
    summary: 'Report on campus, city and political stories for radio and online, with bylines on published pieces.',
    requirements: ['Two writing samples', 'Comfortable with deadlines'],
    perks: ['Published bylines', 'Stipend', 'Radio studio time'],
    source: 'Partner company',
  }),
  seed({
    id: 'jollof-digital', title: 'Digital Marketing and Content Intern', org: 'Jollof Digital Studio', initials: 'JD', color: '#f59e0b',
    type: 'Internship', majors: ['comms', 'business'], levels: [200, 300, 400], location: 'Remote', paid: true,
    stipend: 'GH₵ 900 / month', duration: '3 months', months: 3, dueIn: 6, postedAgo: 1,
    summary: 'Plan and create TikTok and Instagram content for Ghanaian food and fashion brands.',
    requirements: ['Active on social media', 'Basic Canva or CapCut'],
    perks: ['Remote', 'Stipend', 'Brand campaign credits'],
    source: 'Job board',
  }),
  seed({
    id: 'meridian-ba', title: 'Graduate Business Analyst Fellowship', org: 'Meridian Consulting Accra', initials: 'MC', color: '#334155',
    type: 'Fellowship', majors: ['business', 'econ', 'stats'], levels: [400], location: 'Accra', paid: true,
    stipend: 'GH₵ 3,000 / month', duration: '12 months', months: 12, dueIn: 30, postedAgo: 9,
    summary: 'A year-long rotational programme solving strategy problems for banks, telcos and government clients.',
    requirements: ['Final-year student', 'First class or upper second expected', 'Case interview'],
    perks: ['Highest stipend on InternGH', 'Structured training', 'Full-time pathway'],
    source: 'Partner company', featured: true,
  }),
  seed({
    id: 'lih-bootcamp', title: 'Startup Founders Bootcamp', org: 'Legon Innovation Hub', initials: 'LH', color: '#9333ea',
    type: 'Training', majors: ['business', 'cs', 'agric', 'comms'], levels: ALL, location: 'Legon campus', paid: false,
    stipend: 'Free · seed grants for winners', duration: '6 weeks', months: 1.5, dueIn: 12, postedAgo: 3,
    summary: 'Turn a business idea into a pitch. Evening sessions with founders, ending in a demo day with GH₵ 20,000 in grants.',
    requirements: ['Team of 2 to 4', 'One-paragraph idea'],
    perks: ['Seed grants', 'Mentors', 'Co-working space'],
    source: 'Department',
  }),
  seed({
    id: 'shieldnet-cyber', title: 'Cybersecurity Trainee Program', org: 'ShieldNet West Africa', initials: 'SW', color: '#0f172a',
    type: 'Training', majors: ['cs'], levels: [200, 300, 400], location: 'Accra', paid: true,
    stipend: 'GH₵ 1,100 / month', duration: '4 months', months: 4, dueIn: 14, postedAgo: 2,
    summary: 'Learn network defence and incident response in a security operations centre protecting Ghanaian banks.',
    requirements: ['Basic networking knowledge', 'Linux curiosity'],
    perks: ['Industry certification voucher', 'Stipend'],
    source: 'Partner company',
  }),
  seed({
    id: 'ug-ml-ra', title: 'Machine Learning Research Assistant', org: 'Dept. of Computer Science, UG', initials: 'UG', color: '#2563eb',
    type: 'Internship', majors: ['cs', 'stats'], levels: [300, 400], location: 'Legon campus', paid: true,
    stipend: 'GH₵ 600 / month', duration: 'One semester', months: 4, dueIn: 0.7, postedAgo: 11,
    summary: 'Help build a speech dataset for Twi and Ga and train models for a published research project.',
    requirements: ['Python', 'Speaks Twi or Ga (a plus)'],
    perks: ['Research credit', 'Stipend', 'Recommendation letter'],
    source: 'Department',
  }),
  seed({
    id: 'lighthouse-paeds', title: 'Paediatric Nursing Fellowship', org: "Lighthouse Children's Hospital", initials: 'LC', color: '#0284c7',
    type: 'Fellowship', majors: ['nursing'], levels: [400], location: 'Accra', paid: true,
    stipend: 'GH₵ 1,400 / month', duration: '6 months', months: 6, dueIn: 19, postedAgo: 4,
    summary: 'A six-month fellowship in paediatric and neonatal care with structured teaching from senior nurses.',
    requirements: ['Final-year nursing student', 'Clinical placement record'],
    perks: ['Stipend', 'Neonatal care training', 'Job pathway'],
    source: 'Career office',
  }),
  seed({
    id: 'moot-court', title: 'International Moot Court Training', org: 'UG School of Law Moot Society', initials: 'MS', color: '#7f1d1d',
    type: 'Workshop', majors: ['law'], levels: ALL, location: 'Legon campus', paid: false,
    stipend: 'Free', duration: '4 weekends', months: 1, dueIn: 9, postedAgo: 2,
    summary: 'Weekend training in oral advocacy and memorial writing, with selection for the African moot court team.',
    requirements: ['Any level', 'Short motivation statement'],
    perks: ['Team selection', 'Coaching from alumni'],
    source: 'Department',
  }),
  seed({
    id: 'waei-school', title: 'Monetary Policy Summer School', org: 'West Africa Economics Institute', initials: 'WE', color: '#a16207',
    type: 'Workshop', majors: ['econ', 'stats', 'business'], levels: [300, 400], location: 'Accra', paid: false,
    stipend: 'Free · lunch and materials', duration: '2 weeks', months: 0.5, dueIn: 16, postedAgo: 5,
    summary: 'Two weeks of lectures and simulations on how central banks set interest rates and manage inflation.',
    requirements: ['Third or final year', 'Transcript'],
    perks: ['Certificate', 'Networking dinner'],
    source: 'Alumni network',
  }),
  seed({
    id: 'tema-logistics', title: 'Supply Chain Intern', org: 'Tema Port Logistics', initials: 'TP', color: '#0369a1',
    type: 'Internship', majors: ['business', 'econ'], levels: [300, 400], location: 'Tema', paid: true,
    stipend: 'GH₵ 1,300 / month', duration: '3 months', months: 3, dueIn: 8.5, postedAgo: 6,
    summary: 'Track container movements, analyse delays and help improve how goods move through Tema port.',
    requirements: ['Excel', 'Attention to detail'],
    perks: ['Stipend', 'Port site visits', 'Safety training'],
    source: 'Job board',
  }),
  seed({
    id: 'child-lab', title: 'Child Development Research Assistant', org: 'Legon Child Lab', initials: 'CL', color: '#be185d',
    type: 'Internship', majors: ['psych', 'stats'], levels: [200, 300, 400], location: 'Legon campus', paid: true,
    stipend: 'GH₵ 500 / month', duration: 'One semester', months: 4, dueIn: 3.9, postedAgo: 7,
    summary: 'Run play-based assessments with children and parents, and help code video data for a longitudinal study.',
    requirements: ['Research methods course', 'Patient with children'],
    perks: ['Research credit', 'Stipend'],
    source: 'Department',
  }),
  seed({
    id: 'afro-audio', title: 'Podcast Production Workshop', org: 'Afrobeat Audio Collective', initials: 'AA', color: '#c2410c',
    type: 'Workshop', majors: ['comms'], levels: ALL, location: 'Remote', paid: false,
    stipend: 'Free', duration: '4 days', months: 0.15, dueIn: 5.5, postedAgo: 1,
    summary: 'Learn to plan, record and edit a podcast episode on your phone, then publish it on the collective network.',
    requirements: ['A smartphone', 'An idea for a show'],
    perks: ['Published episode', 'Certificate'],
    source: 'Student tip', verified: false,
  }),
  seed({
    id: 'nfn-extension', title: 'Agricultural Extension Volunteer', org: 'Northern Farmers Network', initials: 'NF', color: '#3f6212',
    type: 'Training', majors: ['agric'], levels: [100, 200, 300], location: 'Tamale', paid: false,
    stipend: 'Unpaid · housing and meals', duration: '8 weeks', months: 2, dueIn: 22, postedAgo: 8,
    summary: 'Teach improved planting and storage methods to farmer groups during the long vacation.',
    requirements: ['Agriculture student', 'Available for the full 8 weeks'],
    perks: ['Housing and meals', 'Field certificate'],
    source: 'Career office',
  }),
  seed({
    id: 'survey-enum', title: 'Household Survey Field Intern', org: 'Ghana Insights Research', initials: 'GI', color: '#0891b2',
    type: 'Internship', majors: ['stats', 'econ', 'polisci'], levels: [200, 300, 400], location: 'Accra', paid: true,
    stipend: 'GH₵ 850 / month + transport', duration: '10 weeks', months: 2.5, dueIn: 3.6, postedAgo: 4,
    summary: 'Collect and check household survey data on tablets across Greater Accra, then help clean it for analysis.',
    requirements: ['Completed STAT 2xx courses', 'Speaks Twi, Ga or Ewe', 'Comfortable travelling within Accra'],
    perks: ['Transport allowance', 'Data cleaning training', 'Reference letter'],
    source: 'Career office',
  }),
  seed({
    id: 'actuarial-summer', title: 'Actuarial Summer Internship', org: 'Gold Coast Assurance', initials: 'GC', color: '#b45309',
    type: 'Internship', majors: ['stats', 'business'], levels: [200, 300, 400], location: 'Accra', paid: true,
    stipend: 'GH₵ 1,400 / month', duration: '8 weeks', months: 2, dueIn: 12.5, postedAgo: 2,
    summary: 'Help the pricing team build life insurance models in Excel and learn how actuaries set premiums.',
    requirements: ['Strong in probability', 'Excel', 'Interest in actuarial exams'],
    perks: ['Stipend', 'Exam fee support', 'Mentor from a qualified actuary'],
    source: 'Partner company', featured: true,
  }),
  seed({
    id: 'data-viz-workshop', title: 'Data Storytelling Workshop', org: 'Open Data Ghana', initials: 'OD', color: '#7c3aed',
    type: 'Workshop', majors: ['stats', 'comms', 'cs', 'econ'], levels: ALL, location: 'Remote', paid: false,
    stipend: 'Free', duration: '2 evenings', months: 0.05, dueIn: 1.4, postedAgo: 3,
    summary: 'Two evening sessions on turning spreadsheets into clear charts and stories that people actually read.',
    requirements: ['Open to all levels', 'Google Sheets or Excel'],
    perks: ['Certificate', 'Template pack'],
    source: 'Student tip',
  }),
  seed({
    id: 'nss-it-support', title: 'IT Support Attachment', org: 'Achimota Digital Services', initials: 'AD', color: '#0f766e',
    type: 'Internship', majors: ['cs'], levels: [100, 200, 300], location: 'Accra', paid: true,
    stipend: 'GH₵ 600 / month', duration: '8 weeks', months: 2, dueIn: 6.8, postedAgo: 5,
    summary: 'Set up laptops, fix network issues and support staff at a busy digital services office during the long vacation.',
    requirements: ['Basic computer hardware knowledge', 'Friendly with users'],
    perks: ['Stipend', 'Hands-on networking experience'],
    source: 'Alumni network',
  }),
]

export const OPP_TYPES: OppType[] = ['Internship', 'Fellowship', 'Workshop', 'Training']
