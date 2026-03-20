import { useState, useEffect } from "react"

const cfgCookieName = (id) => `jobagent_config_${id}`

const writeCfgCookie = (id, cfg) => {
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${cfgCookieName(id)}=${btoa(JSON.stringify(cfg))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`
}

const readCfgCookie = (id) => {
  try {
    const prefix = cfgCookieName(id) + '='
    const part = document.cookie.split(';').find(c => c.trim().startsWith(prefix))
    if (!part) return null
    return JSON.parse(atob(part.trim().slice(prefix.length)))
  } catch { return null }
}

const G = 'linear-gradient(135deg,#7C3AED 0%,#DB2777 50%,#F97316 100%)'
const gT = { background: G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

const ST = {
  Applied:   { c: '#60A5FA', b: 'rgba(96,165,250,0.13)' },
  Interview: { c: '#C084FC', b: 'rgba(192,132,252,0.13)' },
  Offer:     { c: '#34D399', b: 'rgba(52,211,153,0.13)' },
  Rejected:  { c: '#F87171', b: 'rgba(248,113,113,0.13)' },
  Withdrawn: { c: '#9CA3AF', b: 'rgba(156,163,175,0.1)' },
}

const EMAIL_ST = {
  'Interview Request': { c: '#C084FC', b: 'rgba(192,132,252,0.13)' },
  'Offer':             { c: '#34D399', b: 'rgba(52,211,153,0.13)' },
  'Rejection':         { c: '#F87171', b: 'rgba(248,113,113,0.13)' },
  'Follow-up Needed':  { c: '#FBBF24', b: 'rgba(251,191,36,0.13)' },
  'Awaiting Reply':    { c: '#60A5FA', b: 'rgba(96,165,250,0.13)' },
}

const DEFAULT_CONFIG = {
  jobTitles: [], industries: [], locations: [],
  salaryMin: 50, salaryMax: 120,
  jobTypes: ['Full-time'],
  keywords: ['application','interview','offer','recruitment','position','opportunity','vacancy','hiring','career','job','kandidaat','sollicitatie','entretien','candidature','poste','recrutement'],
  languages: ['EN'],
  scanFrequency: 'Every 6 hours',
  autoDraft: true, autoLog: true, interviewAlerts: true,
}
const PRESET_TITLES     = ['Sales Manager','Business Development Manager','Account Executive','Commercial Director','Key Account Manager','Revenue Manager','Sales Director','Partnerships Manager']
const PRESET_INDUSTRIES = ['Technology / SaaS','Finance / Fintech','Real Estate','Consulting','E-commerce','Media & Advertising','Healthcare','Logistics']
const PRESET_LOCATIONS  = ['Brussels','Remote','Amsterdam','Paris','London','Berlin','Luxembourg','Ghent','Antwerp']
const JOB_TYPES         = ['Full-time','Part-time','Contract','Freelance','Remote']
const LANG_OPTIONS      = ['EN','FR','NL','DE']
const SCAN_OPTIONS      = ['Every hour','Every 6 hours','Every day']
const SALARY_OPTIONS    = [30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200]

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? G : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  )
}

const MICHAEL = {
  name: "Michael Van Gyseghem",
  title: "Strategic Sales & Business Development Leader",
  email: "michael.vangyseghem@gmail.com",
  location: "Brussels, Ixelles",
  summary: "Results-oriented Business & Sales Manager with 8+ years of B2B experience spanning (fin)tech, real estate, and international market development. Deep expertise in strategic marketing and business development with a proven ability to penetrate new markets from zero to scale — backed by a track record of launching franchise networks, securing high-value commercial partnerships, and driving multi-market revenue growth across Western and Southern Europe. Trilingual (EN/FR/NL), commercially agile, and skilled at operating at the intersection of strategy and execution.",
  experience: [
    {
      company: "Independent Real Estate Manager", role: "Self-Employed", period: "Jan 2023–Dec 2025", loc: "Ljubljana, Slovenia",
      bullets: [
        "Directed end-to-end sales of residential and commercial assets across Slovenia, Italy, and Montenegro",
        "Developed go-to-market strategies for international portfolios targeting HNW buyers and institutional investors",
        "Built a cross-border network of developers, legal advisors, and brokerage partners across three markets",
        "Operated as a market-entry specialist, establishing brand presence in untapped regional markets",
      ]
    },
    {
      company: "We Invest Real Estate", role: "Business Manager — Franchise Expansion, Flanders", period: "Dec 2020–Nov 2022", loc: "Belgium",
      bullets: [
        "Spearheaded franchise expansion across Flanders, scaling the We Invest network into high-potential markets",
        "Designed commercial strategies to accelerate market penetration and establish brand dominance",
        "Recruited and developed agency directors, building high-performance franchise units from inception",
        "Opened and managed 5 flagship agencies across Antwerp, Leuven, Overijse and surrounding key markets",
      ]
    },
    {
      company: "Gamned", role: "Sales Manager — KAM", period: "Sep 2019–Mar 2020", loc: "Belgium",
      bullets: [
        "Drove commercial success of programmatic advertising solutions across Flanders",
        "Managed full revenue cycle from pipeline development through contract negotiation and delivery",
      ]
    },
    {
      company: "Monizze", role: "Key Account Manager", period: "Feb 2017–Jun 2019", loc: "Belgium",
      bullets: [
        "Led POS activation, growing payment network to 3,000+ terminals across Belgium in 2 years",
        "Conducted C-suite negotiations and oversaw enterprise payment solution implementations",
      ]
    },
  ],
  skills: [
    "Market Penetration Strategy", "B2B Sales Architecture", "Franchise Development",
    "Key Account Management", "Commercial Due Diligence", "Strategic Partnerships",
    "P&L Ownership", "Cross-Border Negotiations", "Go-to-Market Planning",
    "Revenue Growth & Forecasting", "Team Leadership", "CRM & Sales Analytics",
  ],
  languages: [
    { l: "English", lv: "C2", lb: "Native" },
    { l: "Dutch",   lv: "C2", lb: "Native" },
    { l: "French",  lv: "C1", lb: "Fluent" },
    { l: "German",  lv: "B2", lb: "Professional" },
  ],
  education: "Ghent University — Business & Commerce",
}

const INIT_APPS = [
  { id: 1, company: 'Salesforce',   role: 'Strategic Account Executive EMEA',  date: '2026-03-01', status: 'Interview', notes: 'Second round next week', url: '' },
  { id: 2, company: 'HubSpot',      role: 'Sales Director — Benelux',           date: '2026-03-05', status: 'Applied',   notes: '',                    url: '' },
  { id: 3, company: 'Colliers International', role: 'Business Development Manager', date: '2026-03-08', status: 'Applied', notes: 'Referred by contact', url: '' },
]

const callClaude = async (prompt) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  })
  const d = await res.json()
  const t = d.content?.[0]?.text
  if (!t) throw new Error("Empty response")
  return t
}

const C = {
  card:  { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 },
  inp:   { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '9px 13px', color: 'white', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'inherit' },
  btn:   { padding: '10px 22px', background: G, border: 'none', borderRadius: 9, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  ghost: { padding: '10px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'rgba(255,255,255,0.65)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  sec:   { fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
}

const NAV = [
  { id: 'dashboard',     label: 'Dashboard',      icon: '▣' },
  { id: 'analyser',      label: 'JD Analyser',    icon: '◈' },
  { id: 'tracker',       label: 'Applications',   icon: '◉' },
  { id: 'intelligence',  label: 'Intelligence',   icon: '◎' },
  { id: 'autoapply',     label: 'Auto-Apply',     icon: '⚡' },
  { id: 'followups',     label: 'Follow-ups',     icon: '✉' },
  { id: 'interview',     label: 'Interview Prep', icon: '◇' },
  { id: 'profile',       label: 'My Profile',     icon: '◍' },
  { id: 'gmail',         label: 'Gmail Agent',    icon: '✉' },
  { id: 'settings',      label: 'Settings',       icon: '⚙' },
]

export default function App() {
  const [tab, setTab]           = useState('dashboard')
  const [apps, setApps]         = useState(() => { try { const s = localStorage.getItem('jobagent_tracker'); return s ? JSON.parse(s) : INIT_APPS } catch { return INIT_APPS } })
  const [showForm, setShowForm] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [newApp, setNewApp]     = useState({ company: '', role: '', date: today, status: 'Applied', notes: '', url: '' })
  const [jd, setJd]             = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [analysing, setAnalysing] = useState(false)
  const [aErr, setAErr]         = useState('')
  const [iJd, setIJd]           = useState('')
  const [qs, setQs]             = useState(null)
  const [generating, setGenerating] = useState(false)
  const [iErr, setIErr]         = useState('')
  const [openQ, setOpenQ]       = useState(null)
  const [copied, setCopied]     = useState(false)
  const [gmailToken, setGmailToken]       = useState(null)
  const [gmailUser, setGmailUser]         = useState(null)
  const [gmailEmails, setGmailEmails]     = useState([])
  const [gmailLoading, setGmailLoading]   = useState(false)
  const [gmailErr, setGmailErr]           = useState('')
  const [replyDrafts, setReplyDrafts]     = useState({})
  const [replyLoading, setReplyLoading]   = useState({})
  const [openEmail, setOpenEmail]         = useState(null)
  // Compute user + config synchronously before first render — no useEffect needed
  const [{ initUser, initConfig, initDraft }] = useState(() => {
    try {
      const stored = localStorage.getItem('jobagent_user')
      if (stored) {
        const { data, timestamp } = JSON.parse(stored)
        if (Date.now() - timestamp <= 24 * 60 * 60 * 1000) {
          const fromCookie = readCfgCookie(data.id)
          const raw = localStorage.getItem(`jobagent_config_${data.id}`)
          const fromStorage = raw ? JSON.parse(raw) : null
          const cfg = fromCookie ?? fromStorage
          return { initUser: data, initConfig: cfg, initDraft: cfg ? { ...DEFAULT_CONFIG, ...cfg } : { ...DEFAULT_CONFIG } }
        }
        localStorage.removeItem('jobagent_user')
      }
    } catch { localStorage.removeItem('jobagent_user') }
    return { initUser: null, initConfig: null, initDraft: { ...DEFAULT_CONFIG } }
  })
  const [user, setUser]                   = useState(initUser)
  const [loginErr, setLoginErr]           = useState('')
  const [config, setConfig]               = useState(initConfig)
  const [draft, setDraft]                 = useState(initDraft)
  const [initialising, setInitialising]   = useState(true)
  const [wizardStep, setWizardStep]       = useState(1)
  const [wInput, setWInput]               = useState({ title: '', industry: '', location: '', keyword: '' })
  const [toast, setToast]                 = useState(null)
  const [intelJobs, setIntelJobs]         = useState(() => { try { const s = localStorage.getItem('jobagent_intelligence'); return s ? JSON.parse(s).jobs : [] } catch { return [] } })
  const [intelScannedAt, setIntelScannedAt] = useState(() => { try { const s = localStorage.getItem('jobagent_intelligence'); return s ? JSON.parse(s).scannedAt : null } catch { return null } })
  const [intelLoading, setIntelLoading]   = useState(false)
  const [intelErr, setIntelErr]           = useState('')
  const [autoQueue, setAutoQueue]         = useState(() => { try { const s = localStorage.getItem('jobagent_autoapply_queue'); return s ? JSON.parse(s) : [] } catch { return [] } })
  const [autoExpanded, setAutoExpanded]   = useState({})
  const [autoAddForm, setAutoAddForm]     = useState(false)
  const [autoNewJob, setAutoNewJob]       = useState({ title: '', company: '', url: '', platform: 'LinkedIn' })
  const [autoPrepping, setAutoPrepping]   = useState(new Set())
  const [queuePrompt, setQueuePrompt]     = useState(null)
  const [followups, setFollowups]         = useState(() => { try { const s = localStorage.getItem('jobagent_followups'); return s ? JSON.parse(s) : [] } catch { return [] } })
  const [fuDrafting, setFuDrafting]       = useState({})
  const [fuSending, setFuSending]         = useState({})
  const [fuExpanded, setFuExpanded]       = useState({})
  const [outputLanguage, setOutputLanguage] = useState(() => localStorage.getItem('jobagent_output_language') || 'EN')

  const getLanguageInstruction = (lang = outputLanguage) => {
    if (lang === 'FR') return '\n\nWrite your entire response in French. Use formal French appropriate for professional job applications in Belgium.'
    if (lang === 'NL') return '\n\nSchrijf je volledige antwoord in het Nederlands. Gebruik formeel Nederlands dat geschikt is voor professionele sollicitaties in België.'
    return ''
  }

  const setLanguage = (lang) => {
    setOutputLanguage(lang)
    localStorage.setItem('jobagent_output_language', lang)
  }

  const showToast = (msg, ms = 4000) => {
    setToast(msg)
    setTimeout(() => setToast(null), ms)
  }

  useEffect(() => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) return
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    document.head.appendChild(s)
  }, [])

  // Show loading screen for 300ms — user/config already set via lazy initialisers above
  useEffect(() => {
    const t = setTimeout(() => setInitialising(false), 300)
    return () => clearTimeout(t)
  }, [])

  // Restore Gmail token from localStorage if still fresh (<55 min)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobagent_gmail_token')
      if (stored) {
        const { token, email, timestamp } = JSON.parse(stored)
        const ageMin = (Date.now() - timestamp) / 60000
        console.log('[JobAgent] Stored Gmail token found — age:', Math.round(ageMin), 'min')
        if (ageMin < 55) {
          setGmailToken(token)
          if (email) setGmailUser(email)
        } else {
          console.log('[JobAgent] Gmail token expired — clearing')
          localStorage.removeItem('jobagent_gmail_token')
        }
      } else {
        console.log('[JobAgent] No stored Gmail token found')
      }
    } catch { localStorage.removeItem('jobagent_gmail_token') }
  }, [])

  // BUG 2 — persist tracker to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jobagent_tracker', JSON.stringify(apps))
  }, [apps])

  useEffect(() => {
    localStorage.setItem('jobagent_autoapply_queue', JSON.stringify(autoQueue))
  }, [autoQueue])

  useEffect(() => {
    localStorage.setItem('jobagent_followups', JSON.stringify(followups))
  }, [followups])

  // Auto-detect followup opportunities and clean up stale ones whenever tracker or followups change
  useEffect(() => {
    const todayStr    = new Date().toISOString().slice(0, 10)
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    // Map appId → current status for quick lookup
    const appStatusMap = Object.fromEntries(apps.map(a => [a.id, a.status]))

    setFollowups(prev => {
      let updated = [...prev]
      let changed = false

      // ── Cleanup: remove pending/drafted followups no longer relevant ──
      updated = updated.filter(fu => {
        if (fu.status === 'sent') return true  // never remove history
        const appStatus = appStatusMap[fu.appId]
        if (appStatus === undefined) return true  // app deleted — keep followup as orphan
        if (fu.type === 'interview-thankyou' && appStatus !== 'Interview') {
          console.log('[JobAgent] Removing stale followup:', fu.type, 'for', fu.company, '— app status is now', appStatus)
          changed = true
          return false
        }
        if (fu.type === 'rejection-response' && appStatus !== 'Rejected') {
          console.log('[JobAgent] Removing stale followup:', fu.type, 'for', fu.company, '— app status is now', appStatus)
          changed = true
          return false
        }
        return true
      })

      // ── Detection: create new followups for current statuses ──
      apps.forEach(app => {
        const hasType = (type) => updated.some(f => f.appId === app.id && f.type === type)
        const emailMatch = (app.notes || '').match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)
        const recipientEmail = emailMatch ? emailMatch[0] : ''

        if (app.status === 'Applied' && app.date <= sevenDaysAgo && !hasType('applied-followup')) {
          updated.push({ id: Date.now() + Math.random(), appId: app.id, company: app.company, role: app.role, type: 'applied-followup', status: 'pending', dueDate: todayStr, draftedEmail: null, createdAt: todayStr, recipientEmail })
          changed = true
        }
        if (app.status === 'Interview' && !hasType('interview-thankyou')) {
          updated.push({ id: Date.now() + Math.random(), appId: app.id, company: app.company, role: app.role, type: 'interview-thankyou', status: 'pending', dueDate: tomorrowStr, draftedEmail: null, createdAt: todayStr, recipientEmail })
          changed = true
        }
        if (app.status === 'Rejected' && !hasType('rejection-response')) {
          updated.push({ id: Date.now() + Math.random(), appId: app.id, company: app.company, role: app.role, type: 'rejection-response', status: 'pending', dueDate: todayStr, draftedEmail: null, createdAt: todayStr, recipientEmail })
          changed = true
        }
      })

      return changed ? updated : prev
    })
  }, [apps, followups])

  // Read URL params injected by the Chrome extension "Log to Tracker" button
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const role    = params.get('role')
    const company = params.get('company')
    if (!role && !company) return
    const entry = {
      id:      Date.now(),
      company: company || 'Unknown company',
      role:    role    || 'Unknown role',
      date:    params.get('date') || new Date().toISOString().slice(0, 10),
      status:  params.get('status') || 'Applied',
      notes:   '',
      url:     params.get('url') || '',
    }
    setApps(prev => {
      if (prev.some(a => a.url && a.url === entry.url)) return prev
      return [entry, ...prev]
    })
    setTab('tracker')
    showToast(`✓ "${entry.role}" at ${entry.company} added to tracker`)
    setQueuePrompt({ title: entry.role, company: entry.company, url: entry.url, platform: entry.url?.includes('linkedin') ? 'LinkedIn' : entry.url?.includes('welcometothejungle') ? 'WTTJ' : 'LinkedIn', matchScore: 0 })
    // Clean URL without reloading
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  const signIn = () => {
    setLoginErr('')
    if (!window.google) { setLoginErr('Google Identity Services not loaded — refresh and try again.'); return }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) { setLoginErr('Sign-in failed: ' + tokenResponse.error); return }
        try {
          const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
          })
          const u = await r.json()
          const userData = { name: u.name, email: u.email, avatar: u.picture, id: u.sub }
          setUser(userData)
          localStorage.setItem('jobagent_user', JSON.stringify({ data: userData, timestamp: Date.now() }))
          try {
            const fromCookie = readCfgCookie(u.sub)
            const fromStorage = (() => { try { const s = localStorage.getItem(`jobagent_config_${u.sub}`); return s ? JSON.parse(s) : null } catch { return null } })()
            const cfg = fromCookie ?? fromStorage
            if (cfg) { setConfig(cfg); setDraft({ ...DEFAULT_CONFIG, ...cfg }) }
          } catch {}
        } catch (e) { setLoginErr('Failed to fetch profile — please try again.') }
      },
    })
    client.requestAccessToken({ prompt: 'select_account' })
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('jobagent_user')
    localStorage.removeItem('jobagent_gmail_token')
    setGmailToken(null); setGmailUser(null); setGmailEmails([])
  }

  const saveConfig = (cfg) => {
    console.log('Saving config...', cfg)
    if (user?.id) {
      localStorage.setItem(`jobagent_config_${user.id}`, JSON.stringify(cfg))
      writeCfgCookie(user.id, cfg)
      console.log('Config saved to localStorage key:', `jobagent_config_${user.id}`)
    } else {
      console.warn('saveConfig: no user.id — user:', user)
    }
    setConfig(cfg); setDraft({ ...cfg })
    showToast('✓ Settings saved', 2000)
  }
  const dToggle    = (field)       => setDraft(d => ({ ...d, [field]: !d[field] }))
  const dToggleArr = (field, val)  => setDraft(d => ({ ...d, [field]: d[field].includes(val) ? d[field].filter(x => x !== val) : [...d[field], val] }))
  const dAddPreset = (field, val)  => setDraft(d => ({ ...d, [field]: [...new Set([...d[field], val])] }))
  const dRemoveTag = (field, val)  => setDraft(d => ({ ...d, [field]: d[field].filter(x => x !== val) }))
  const dAddTag    = (field, key)  => { const v = wInput[key].trim(); if (!v) return; setDraft(d => ({ ...d, [field]: [...new Set([...d[field], v])] })); setWInput(i => ({ ...i, [key]: '' })) }

  const stats = {
    total:      apps.length,
    active:     apps.filter(a => !['Rejected', 'Withdrawn'].includes(a.status)).length,
    interviews: apps.filter(a => a.status === 'Interview').length,
    offers:     apps.filter(a => a.status === 'Offer').length,
  }

  const addApp = () => {
    if (!newApp.company.trim() || !newApp.role.trim()) return
    setApps(p => [...p, { ...newApp, id: Date.now() }])
    setNewApp({ company: '', role: '', date: today, status: 'Applied', notes: '', url: '' })
    setShowForm(false)
  }
  const updStatus = (id, s) => setApps(p => p.map(a => a.id === id ? { ...a, status: s } : a))
  const delApp    = (id)    => setApps(p => p.filter(a => a.id !== id))

  const parseIntelJobs = (raw) => {
    // Try full parse first
    const start = raw.indexOf('['), end = raw.lastIndexOf(']')
    if (start !== -1 && end !== -1) {
      try { return JSON.parse(raw.slice(start, end + 1)) } catch {}
    }
    // Response was cut off — extract all complete objects via regex
    const matches = [...raw.matchAll(/\{[^{}]*\}/gs)]
    const complete = []
    for (const m of matches) {
      try { complete.push(JSON.parse(m[0])) } catch {}
    }
    if (complete.length > 0) return complete
    throw new Error('No parseable job objects found in response: ' + raw.slice(0, 120))
  }

  const scanIntelligence = async () => {
    setIntelLoading(true); setIntelErr('')
    // Fixed short prompt — settings only affect display/filtering, never the API call
    const prompt = `Generate 5 realistic job opportunities in Belgium/Europe for: Senior Sales and BD professional Brussels Belgium SaaS Fintech Real Estate trilingual. Roles: Sales Director, BD Manager, Account Executive, Head of Sales, Commercial Director. Companies active in Belgium/Europe.

Return ONLY a JSON array, no markdown, no text before or after:
[{"title":"","company":"","location":"","matchScore":80,"applyUrl":"https://www.linkedin.com/jobs/search/?keywords=sales+director&location=Belgium","matchReason":""}]` + getLanguageInstruction()

    const doFetch = async () => fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    try {
      let res = await doFetch()
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 3000))
        res = await doFetch()
      }
      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`API ${res.status}: ${errBody}`)
      }
      const d = await res.json()
      const textBlock = [...(d.content || [])].reverse().find(b => b.type === 'text')
      if (!textBlock?.text) throw new Error(d.error?.message || 'No text block in response — check API key and model access')
      const jobs = parseIntelJobs(textBlock.text)
      const scannedAt = new Date().toISOString()
      setIntelJobs(jobs)
      setIntelScannedAt(scannedAt)
      localStorage.setItem('jobagent_intelligence', JSON.stringify({ jobs, scannedAt }))
    } catch (e) { setIntelErr('Scan failed: ' + e.message) }
    setIntelLoading(false)
  }

  const intelSkillFreq = (jobs) => {
    const freq = {}
    jobs.forEach(j => (j.keyRequirements || []).forEach(r => { freq[r] = (freq[r] || 0) + 1 }))
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }

  const intelDigest = (jobs) => {
    const top = jobs.filter(j => j.matchScore >= 60).slice(0, 3)
    if (!top.length) return
    const body = top.map((j, i) => `${i + 1}. ${j.title} at ${j.company} (${j.location}) — ${j.matchScore}% match\n   ${j.matchReason}\n   Apply: ${j.applyUrl}`).join('\n\n')
    const subject = `JobAgent Daily Digest — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    const mailto = `mailto:michael.vangyseghem@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Your top matches today:\n\n' + body)}`
    window.open(mailto)
  }

  const addToAutoQueue = (job) => {
    const url = job.url || job.applyUrl || ''
    const entry = {
      id: Date.now(),
      title: job.title || job.role || '',
      company: job.company || '',
      url,
      platform: url.includes('linkedin') ? 'LinkedIn' : url.includes('welcometothejungle') ? 'WTTJ' : 'Other',
      matchScore: job.matchScore || 0,
      coverLetter: '',
      formAnswers: {},
      status: 'pending',
      dateAdded: new Date().toISOString().slice(0, 10),
    }
    setAutoQueue(prev => {
      if (prev.some(q => q.url && q.url === entry.url)) { showToast('Already in Auto-Apply queue', 2000); return prev }
      showToast('⚡ Added to Auto-Apply queue', 2000)
      return [entry, ...prev]
    })
  }

  const prepareApplication = async (jobId) => {
    const job = autoQueue.find(j => j.id === jobId)
    if (!job) return
    setAutoPrepping(prev => new Set([...prev, jobId]))
    try {
      const profile = `${MICHAEL.name}, ${MICHAEL.title}. Experience: ${MICHAEL.experience.map(e => `${e.role} at ${e.company} (${e.period})`).join('; ')}. Skills: ${MICHAEL.skills.slice(0, 6).join(', ')}. Languages: EN/FR/NL native/fluent.`
      const prompt = `Write application materials for ${MICHAEL.name} applying to "${job.title}" at "${job.company}". Profile: ${profile}

Return ONLY valid JSON, no markdown:
{"coverLetter":"3 concise paragraphs under 200 words","formAnswers":{"whyThisRole":"2 sentence answer tailored to the role","describeExperience":"2 sentence answer using real experience","salaryExpectation":"€80,000–€110,000 depending on full package","availability":"Available immediately","whyThisCompany":"1 sentence answer"}}` + getLanguageInstruction()
      const text = await callClaude(prompt)
      const start = text.indexOf('{'), end = text.lastIndexOf('}')
      const parsed = JSON.parse(text.slice(start, end + 1))
      setAutoQueue(prev => prev.map(j => j.id === jobId
        ? { ...j, coverLetter: parsed.coverLetter || '', formAnswers: parsed.formAnswers || {}, status: 'prepared' }
        : j))
    } catch (e) {
      console.error('Prepare failed:', e)
      showToast('Preparation failed: ' + e.message, 3000)
    }
    setAutoPrepping(prev => { const s = new Set(prev); s.delete(jobId); return s })
  }

  const analyseJD = async () => {
    if (!jd.trim()) return
    setAnalysing(true); setAnalysis(null); setAErr('')
    try {
      const prof = `Name:${MICHAEL.name}\nTitle:${MICHAEL.title}\nSummary:${MICHAEL.summary}\nSkills:${MICHAEL.skills.join(', ')}\nExperience:${MICHAEL.experience.map(e => `${e.role} at ${e.company} (${e.period})`).join(' | ')}\nLanguages:${MICHAEL.languages.map(l => `${l.l} ${l.lv}`).join(', ')}`
      const prompt = `You are an expert career coach. Analyse this job description for the candidate and return ONLY valid JSON, no markdown, no code fences, no preamble.\n\nCANDIDATE:\n${prof}\n\nJOB DESCRIPTION:\n${jd}\n\nReturn exactly:\n{"jobTitle":"title","company":"company or Unknown","matchScore":85,"matchedSkills":["skill1","skill2"],"gaps":["gap1"],"tailoredSummary":"3-sentence first-person summary tailored to this role using Michael's actual experience","coverLetter":"Professional 3-paragraph cover letter for this exact role. Sign as Michael Van Gyseghem.","keyTalkingPoints":["point1","point2","point3"]}` + getLanguageInstruction()
      const raw = await callClaude(prompt)
      setAnalysis(JSON.parse(raw.replace(/```json|```/g, '').trim()))
    } catch (e) { setAErr('Analysis failed — check your API key in the .env file and try again.') }
    setAnalysing(false)
  }

  const genQuestions = async () => {
    if (!iJd.trim()) return
    setGenerating(true); setQs(null); setIErr('')
    try {
      const exp = MICHAEL.experience.map(e => `${e.role} at ${e.company}: ${e.bullets[0]}`).join(' | ')
      const prompt = `You are an expert interview coach. Generate 6 targeted interview questions with STAR-format answers using this candidate's specific experience. Return ONLY valid JSON, no markdown.\n\nCANDIDATE: ${MICHAEL.name}\nEXPERIENCE: ${exp}\nSKILLS: ${MICHAEL.skills.join(', ')}\n\nJOB DESCRIPTION:\n${iJd}\n\nReturn exactly:\n{"questions":[{"question":"?","type":"Behavioral","difficulty":"Medium","suggestedAnswer":"STAR-format answer using Michael's real experience (3-4 sentences)"}]}` + getLanguageInstruction()
      const raw = await callClaude(prompt)
      setQs(JSON.parse(raw.replace(/```json|```/g, '').trim()))
    } catch (e) { setIErr('Generation failed — please try again.') }
    setGenerating(false)
  }

  const copyText = async (t) => {
    try { await navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch (e) {}
  }

  const goToTracker = (comp, role) => {
    setNewApp(p => ({ ...p, company: comp && comp !== 'Unknown' ? comp : '', role: role || '' }))
    setShowForm(true); setTab('tracker')
  }

  const classifyEmail = (subject, snippet) => {
    const t = (subject + ' ' + snippet).toLowerCase()
    if (/interview|call scheduled|meet|zoom|teams|video call/i.test(t)) return 'Interview Request'
    if (/offer|congratulations|pleased to|we.d like to|selected for/i.test(t)) return 'Offer'
    if (/regret|unfortunately|not.*moving forward|other candidates|not.*selected|won.t be/i.test(t)) return 'Rejection'
    if (/follow.?up|checking in|any update|heard back|following up/i.test(t)) return 'Follow-up Needed'
    return 'Awaiting Reply'
  }

  const connectGmail = () => {
    if (!window.google) { setGmailErr('Google Identity Services not loaded — refresh and try again.'); return }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) { setGmailErr('Auth failed: ' + tokenResponse.error); return }
        setGmailToken(tokenResponse.access_token)
        let emailAddr = null
        try {
          const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + tokenResponse.access_token } })
          const u = await r.json()
          emailAddr = u.email
          setGmailUser(emailAddr)
        } catch (e) {}
        localStorage.setItem('jobagent_gmail_token', JSON.stringify({ token: tokenResponse.access_token, email: emailAddr, timestamp: Date.now() }))
        scanInbox(tokenResponse.access_token)
      },
    })
    client.requestAccessToken({ prompt: 'consent' })
  }

  const scanInbox = async (token) => {
    setGmailLoading(true); setGmailErr(''); setGmailEmails([])
    const q = 'application OR interview OR offer OR recruitment OR position OR opportunity OR vacancy OR hiring OR career OR job OR kandidaat OR sollicitatie OR entretien OR candidature OR poste OR recrutement'
    try {
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=15`,
        { headers: { Authorization: 'Bearer ' + token } }
      )
      const listData = await listRes.json()
      if (!listData.messages?.length) { setGmailLoading(false); return }
      const emails = await Promise.all(
        listData.messages.map(async ({ id }) => {
          const r = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers: { Authorization: 'Bearer ' + token } }
          )
          const msg = await r.json()
          const hdr = msg.payload?.headers || []
          const get = n => hdr.find(h => h.name === n)?.value || ''
          const subj = get('Subject')
          const snip = msg.snippet || ''
          return { id, from: get('From'), subject: subj, date: get('Date'), snippet: snip, status: classifyEmail(subj, snip) }
        })
      )
      setGmailEmails(emails)
    } catch (e) { setGmailErr('Failed to scan inbox: ' + e.message) }
    setGmailLoading(false)
  }

  const updateFollowupDraft = (id, field, value) => {
    setFollowups(p => p.map(f => {
      if (f.id !== id) return f
      if (field === 'recipientEmail') return { ...f, recipientEmail: value }
      return { ...f, draftedEmail: { ...f.draftedEmail, [field]: value } }
    }))
  }

  const draftFollowup = async (fuId) => {
    const fu = followups.find(f => f.id === fuId)
    if (!fu) return
    setFuDrafting(p => ({ ...p, [fuId]: true }))
    const langInstr = getLanguageInstruction()
    const prompts = {
      'applied-followup': `Write a concise 3-paragraph professional follow-up email from Michael Van Gyseghem to ${fu.company} checking on the status of his application for the ${fu.role} role. Be polite, express continued interest, and ask for a timeline update. Sign as Michael Van Gyseghem. Return ONLY valid JSON: {"subject":"Re: Application for ${fu.role}","body":"email body here"}` + langInstr,
      'interview-thankyou': `Write a warm, professional thank-you email from Michael Van Gyseghem to ${fu.company} after interviewing for the ${fu.role} position. Thank them for their time, reiterate his strong interest and fit, and mention looking forward to next steps. Keep it under 150 words. Return ONLY valid JSON: {"subject":"Thank you — ${fu.role} interview","body":"email body here"}` + langInstr,
      'rejection-response': `Write a gracious, professional response from Michael Van Gyseghem to ${fu.company} after being rejected for the ${fu.role} role. Thank them for their time, express appreciation for the opportunity, and politely ask to be considered for future suitable roles. Keep it brief and positive. Return ONLY valid JSON: {"subject":"Re: ${fu.role} application","body":"email body here"}` + langInstr,
    }
    try {
      const raw = await callClaude(prompts[fu.type])
      const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
      const parsed = JSON.parse(raw.slice(start, end + 1))
      setFollowups(p => p.map(f => f.id === fuId ? { ...f, draftedEmail: parsed, status: 'drafted' } : f))
    } catch (e) { showToast('Draft failed: ' + e.message, 3000) }
    setFuDrafting(p => ({ ...p, [fuId]: false }))
  }

  const sendFollowup = async (fuId) => {
    const fu = followups.find(f => f.id === fuId)
    if (!fu?.draftedEmail) return
    if (!gmailToken) { showToast('Connect Gmail first in the Gmail Agent tab', 3000); return }
    if (!fu.recipientEmail?.trim()) { showToast('Please enter the recruiter email address', 3000); return }
    setFuSending(p => ({ ...p, [fuId]: true }))
    try {
      const to = fu.recipientEmail.trim()
      const cc = 'michael.vangyseghem@gmail.com'
      const emailLines = [`To: ${to}`, `Cc: ${cc}`, `Subject: ${fu.draftedEmail.subject}`, 'Content-Type: text/plain; charset=utf-8', '', fu.draftedEmail.body].join('\r\n')
      const encoded = btoa(unescape(encodeURIComponent(emailLines))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + gmailToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: encoded }),
      })
      if (!res.ok) { const e = await res.text(); throw new Error(e) }
      const sentDate = new Date().toISOString().slice(0, 10)
      setFollowups(p => p.map(f => f.id === fuId ? { ...f, status: 'sent' } : f))
      setApps(p => p.map(a => a.id === fu.appId ? { ...a, notes: (a.notes ? a.notes + ' · ' : '') + `Followed up on ${sentDate}` } : a))
      showToast(`✓ Follow-up sent to ${fu.company}`, 3000)
    } catch (e) { showToast('Send failed: ' + e.message, 3000) }
    setFuSending(p => ({ ...p, [fuId]: false }))
  }

  const draftReply = async (id, from, subject, snippet) => {
    setReplyLoading(p => ({ ...p, [id]: true }))
    try {
      const prompt = `You are drafting a professional email reply on behalf of ${MICHAEL.name}, ${MICHAEL.title}.\n\nINCOMING EMAIL:\nFrom: ${from}\nSubject: ${subject}\nContent: ${snippet}\n\nDraft a concise, professional reply from Michael's perspective. Reference his relevant B2B sales and business development experience where appropriate. Keep it under 150 words. Output only the email body, no subject line.`
      const reply = await callClaude(prompt)
      setReplyDrafts(p => ({ ...p, [id]: reply }))
    } catch (e) { setReplyDrafts(p => ({ ...p, [id]: 'Failed to generate reply.' })) }
    setReplyLoading(p => ({ ...p, [id]: false }))
  }

  if (initialising) return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', margin: '0 auto 16px' }}>J</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Loading…</div>
      </div>
    </div>
  )

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#07070F', color: '#E8E8F4', fontFamily: "'Sora', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 420, width: '100%', padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ width: 64, height: 64, borderRadius: 18, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 auto 20px' }}>J</div>

        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 8px' }}>
          Job<span style={gT}>Agent</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.36)', marginBottom: 48, lineHeight: 1.6 }}>
          Your AI-powered job search command centre.<br />Sign in to get started.
        </p>

        <button
          onClick={signIn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'white', color: '#1a1a1a', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%', justifyContent: 'center' }}
        >
          <svg viewBox="0 0 48 48" style={{ width: 20, height: 20, flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.1-6.1C34.46 3.09 29.5 1 24 1 14.82 1 7.07 6.48 3.74 14.22l7.19 5.59C12.7 13.74 17.9 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.18 37.4 46.1 31.45 46.1 24.55z"/>
            <path fill="#FBBC05" d="M10.93 28.19A14.6 14.6 0 0 1 9.5 24c0-1.46.25-2.88.69-4.19L2.99 14.22A22.93 22.93 0 0 0 1 24c0 3.77.9 7.34 2.49 10.5l7.44-6.31z"/>
            <path fill="#34A853" d="M24 47c5.95 0 10.95-1.97 14.6-5.35l-7.19-5.59C29.46 37.6 26.9 38.5 24 38.5c-6.1 0-11.3-4.24-13.07-9.95l-7.44 6.31C7.07 43.03 14.82 47 24 47z"/>
          </svg>
          Sign in with Google
        </button>

        {loginErr && <div style={{ marginTop: 16, color: '#F87171', fontSize: 12 }}>{loginErr}</div>}

        <p style={{ marginTop: 32, fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
          Read-only access · Your data stays in this session
        </p>
      </div>
    </div>
  )

  if (user && !config) {
    const tagStyle    = { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)', color: '#C4B5FD', fontWeight: 500 }
    const presetStyle = { fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit' }
    const sLabel      = { fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10, display: 'block' }
    const sec         = { marginBottom: 26 }
    const selOpt      = (on) => ({ fontSize: 12, padding: '7px 16px', borderRadius: 10, background: on ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${on ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`, color: on ? '#C4B5FD' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: on ? 600 : 400 })
    return (
      <div style={{ minHeight: '100vh', background: '#07070F', color: '#E8E8F4', fontFamily: "'Sora', system-ui, sans-serif", display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px 80px' }}>
        <div style={{ width: '100%', maxWidth: 620 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>J</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>JobAgent <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>· Setup Wizard</span></span>
          </div>

          {/* Progress stepper */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 36 }}>
            {[{ n: 1, label: 'Preferences' }, { n: 2, label: 'Search' }, { n: 3, label: 'Behaviour' }].map(({ n, label }, i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'flex-start' }}>
                {i > 0 && <div style={{ width: 64, height: 1, background: wizardStep > i ? G : 'rgba(255,255,255,0.1)', marginTop: 15, flexShrink: 0 }} />}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: wizardStep >= n ? G : 'rgba(255,255,255,0.07)', border: wizardStep >= n ? 'none' : '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: wizardStep >= n ? 'white' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    {wizardStep > n ? '✓' : n}
                  </div>
                  <span style={{ fontSize: 10, color: wizardStep >= n ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '32px 36px', marginBottom: 16 }}>

            {/* ── STEP 1 ── */}
            {wizardStep === 1 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', margin: '0 0 6px' }}>Job <span style={gT}>Preferences</span></h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', marginBottom: 28, lineHeight: 1.6 }}>Tell the agent what kind of roles you're targeting.</p>

                {/* Job Titles */}
                <div style={sec}>
                  <span style={sLabel}>Target Job Titles</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {draft.jobTitles.map(t => <span key={t} style={tagStyle}>{t} <button onClick={() => dRemoveTag('jobTitles', t)} style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button></span>)}
                    {PRESET_TITLES.filter(t => !draft.jobTitles.includes(t)).map(t => <button key={t} onClick={() => dAddPreset('jobTitles', t)} style={presetStyle}>+ {t}</button>)}
                  </div>
                  <input value={wInput.title} onChange={e => setWInput(i => ({ ...i, title: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dAddTag('jobTitles', 'title') } }} placeholder="Type custom title + Enter" style={{ ...C.inp, fontSize: 12 }} />
                </div>

                {/* Industries */}
                <div style={sec}>
                  <span style={sLabel}>Target Industries</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {draft.industries.map(t => <span key={t} style={tagStyle}>{t} <button onClick={() => dRemoveTag('industries', t)} style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button></span>)}
                    {PRESET_INDUSTRIES.filter(t => !draft.industries.includes(t)).map(t => <button key={t} onClick={() => dAddPreset('industries', t)} style={presetStyle}>+ {t}</button>)}
                  </div>
                  <input value={wInput.industry} onChange={e => setWInput(i => ({ ...i, industry: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dAddTag('industries', 'industry') } }} placeholder="Type custom industry + Enter" style={{ ...C.inp, fontSize: 12 }} />
                </div>

                {/* Locations */}
                <div style={sec}>
                  <span style={sLabel}>Preferred Locations</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {draft.locations.map(t => <span key={t} style={tagStyle}>{t} <button onClick={() => dRemoveTag('locations', t)} style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button></span>)}
                    {PRESET_LOCATIONS.filter(t => !draft.locations.includes(t)).map(t => <button key={t} onClick={() => dAddPreset('locations', t)} style={presetStyle}>+ {t}</button>)}
                  </div>
                  <input value={wInput.location} onChange={e => setWInput(i => ({ ...i, location: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dAddTag('locations', 'location') } }} placeholder="Type custom location + Enter" style={{ ...C.inp, fontSize: 12 }} />
                </div>

                {/* Salary */}
                <div style={sec}>
                  <span style={sLabel}>Salary Range (Annual)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <select value={draft.salaryMin} onChange={e => setDraft(d => ({ ...d, salaryMin: +e.target.value }))} style={{ ...C.inp, width: 'auto', cursor: 'pointer' }}>
                      {SALARY_OPTIONS.filter(s => s < draft.salaryMax).map(s => <option key={s} value={s}>€{s}k</option>)}
                    </select>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</span>
                    <select value={draft.salaryMax} onChange={e => setDraft(d => ({ ...d, salaryMax: +e.target.value }))} style={{ ...C.inp, width: 'auto', cursor: 'pointer' }}>
                      {SALARY_OPTIONS.filter(s => s > draft.salaryMin).map(s => <option key={s} value={s}>€{s}k</option>)}
                    </select>
                    <span style={{ fontSize: 13, ...gT, fontWeight: 700 }}>€{draft.salaryMin}k – €{draft.salaryMax}k</span>
                  </div>
                </div>

                {/* Job Types */}
                <div style={{ ...sec, marginBottom: 0 }}>
                  <span style={sLabel}>Job Type</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {JOB_TYPES.map(t => <button key={t} onClick={() => dToggleArr('jobTypes', t)} style={selOpt(draft.jobTypes.includes(t))}>{draft.jobTypes.includes(t) ? '✓ ' : ''}{t}</button>)}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {wizardStep === 2 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', margin: '0 0 6px' }}>Search <span style={gT}>Settings</span></h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', marginBottom: 28, lineHeight: 1.6 }}>Customise how the Gmail Agent scans your inbox.</p>

                {/* Keywords */}
                <div style={sec}>
                  <span style={sLabel}>Email Detection Keywords</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {draft.keywords.map(k => <span key={k} style={tagStyle}>{k} <button onClick={() => dRemoveTag('keywords', k)} style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button></span>)}
                  </div>
                  <input value={wInput.keyword} onChange={e => setWInput(i => ({ ...i, keyword: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dAddTag('keywords', 'keyword') } }} placeholder="Add keyword + Enter" style={{ ...C.inp, fontSize: 12 }} />
                </div>

                {/* Languages */}
                <div style={sec}>
                  <span style={sLabel}>Language Preferences</span>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {LANG_OPTIONS.map(l => <button key={l} onClick={() => dToggleArr('languages', l)} style={{ ...selOpt(draft.languages.includes(l)), padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>{l}</button>)}
                  </div>
                </div>

                {/* Scan frequency */}
                <div style={{ ...sec, marginBottom: 0 }}>
                  <span style={sLabel}>Auto-Scan Frequency</span>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {SCAN_OPTIONS.map(opt => <button key={opt} onClick={() => setDraft(d => ({ ...d, scanFrequency: opt }))} style={selOpt(draft.scanFrequency === opt)}>{draft.scanFrequency === opt ? '● ' : '○ '}{opt}</button>)}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {wizardStep === 3 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', margin: '0 0 6px' }}>Agent <span style={gT}>Behaviour</span></h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', marginBottom: 28, lineHeight: 1.6 }}>Configure what the agent does automatically.</p>

                {[
                  { field: 'autoDraft',        title: 'Auto-draft Replies',          desc: 'Automatically generate AI reply drafts for job emails' },
                  { field: 'autoLog',           title: 'Auto-log to Tracker',         desc: 'Automatically add detected job emails to the Application Tracker' },
                  { field: 'interviewAlerts',   title: 'Interview Detection Alerts',  desc: 'Highlight and alert when an interview request is detected' },
                ].map(({ field, title, desc }) => (
                  <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{desc}</div>
                    </div>
                    <Toggle on={draft[field]} onToggle={() => dToggle(field)} />
                  </div>
                ))}

                {/* Summary */}
                <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 }}>Setup Summary</div>
                  {[
                    { label: 'Targeting',  value: draft.jobTitles.length ? draft.jobTitles.slice(0,3).join(', ') + (draft.jobTitles.length > 3 ? ` +${draft.jobTitles.length - 3} more` : '') : 'Any role' },
                    { label: 'Industries', value: draft.industries.length ? draft.industries.slice(0,2).join(', ') + (draft.industries.length > 2 ? ` +${draft.industries.length - 2}` : '') : 'Any' },
                    { label: 'Locations',  value: draft.locations.length ? draft.locations.slice(0,3).join(', ') : 'Any' },
                    { label: 'Salary',     value: `€${draft.salaryMin}k – €${draft.salaryMax}k` },
                    { label: 'Job Types',  value: draft.jobTypes.join(', ') || 'Any' },
                    { label: 'Languages',  value: draft.languages.join(', ') },
                    { label: 'Scan',       value: draft.scanFrequency },
                    { label: 'Keywords',   value: `${draft.keywords.length} active` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>{label}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {wizardStep > 1 && <button onClick={() => setWizardStep(s => s - 1)} style={{ ...C.ghost, fontSize: 12 }}>← Back</button>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>Step {wizardStep} of 3</span>
              {wizardStep < 3
                ? <button onClick={() => setWizardStep(s => s + 1)} style={{ ...C.btn, fontSize: 13 }}>Next Step →</button>
                : <button onClick={() => { saveConfig(draft); setTab('dashboard') }} style={{ ...C.btn, fontSize: 13 }}>🚀 Launch JobAgent</button>
              }
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', color: '#E8E8F4', fontFamily: "'Sora', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', color: '#34D399', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 600, zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* QUEUE PROMPT */}
      {queuePrompt && (
        <div style={{ position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)', background: '#1A1A2E', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 12, padding: '14px 20px', fontSize: 13, zIndex: 9998, boxShadow: '0 4px 32px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>⚡ Add <strong style={{ color: 'white' }}>"{queuePrompt.title}"</strong> to Auto-Apply queue?</span>
          <button onClick={() => { addToAutoQueue(queuePrompt); setQueuePrompt(null) }} style={{ ...C.btn, padding: '6px 14px', fontSize: 12 }}>Yes</button>
          <button onClick={() => setQueuePrompt(null)} style={{ ...C.ghost, padding: '6px 14px', fontSize: 12 }}>No</button>
        </div>
      )}

      {/* TOPBAR */}
      <div style={{ height: 54, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>J</div>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px' }}>JobAgent</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.07)', padding: '2px 7px', borderRadius: 20 }}>v1.0 beta</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Language selector */}
          <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 3 }}>
            {['EN', 'FR', 'NL'].map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: outputLanguage === lang ? G : 'transparent', color: outputLanguage === lang ? 'white' : 'rgba(255,255,255,0.35)', transition: 'all 0.15s' }}>
                {lang}
              </button>
            ))}
          </div>
          {user.avatar
            ? <img src={user.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 26, height: 26, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>{user.name?.[0] ?? '?'}</div>
          }
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{user.name}</span>
          <button onClick={signOut} style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* SIDEBAR */}
        <div style={{ width: 195, borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 10px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 'calc(100vh - 54px)' }}>
          {NAV.map(({ id, label, icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 8, border: 'none', textAlign: 'left', width: '100%', fontSize: 12, fontWeight: active ? 600 : 400, background: active ? 'rgba(255,255,255,0.07)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', borderLeft: active ? '2px solid #DB2777' : '2px solid transparent', fontFamily: 'inherit' }}>
                <span style={{ fontSize: 13, ...(active ? gT : { color: 'rgba(255,255,255,0.28)' }) }}>{icon}</span>
                {label}
              </button>
            )
          })}

          <div style={{ marginTop: 'auto', padding: '14px 11px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginBottom: 8, letterSpacing: 1.2 }}>COMING SOON</div>
            {['Gmail Agent', 'Chrome Extension', 'LinkedIn Sync', 'Auto-Apply'].map(f => (
              <div key={f} style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-block' }}></span>{f}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Good morning, <span style={gT}>Michael</span> 👋</h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Your job search command centre.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 22 }}>
                {[
                  { l: 'Total Applied',    v: stats.total,      e: '📋' },
                  { l: 'Active Pipeline',  v: stats.active,     e: '🔥' },
                  { l: 'Interviews',       v: stats.interviews, e: '💬' },
                  { l: 'Offers',           v: stats.offers,     e: '🎯' },
                ].map(({ l, v, e }) => (
                  <div key={l} style={{ ...C.card, textAlign: 'center', padding: 16 }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{e}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, ...gT }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.36)', marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...C.card, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Recent Applications</span>
                  <button onClick={() => setTab('tracker')} style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View all →</button>
                </div>
                {apps.slice(0, 4).map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{a.company}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.36)', marginTop: 1 }}>{a.role}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{a.date}</span>
                      <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 20, background: ST[a.status]?.b, color: ST[a.status]?.c, fontWeight: 600 }}>{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { id: 'analyser',  icon: '◈', t: 'Analyse a Job Description', s: 'AI-tailored resume summary + cover letter' },
                  { id: 'interview', icon: '◎', t: 'Interview Prep',             s: 'Targeted questions with STAR-format answers' },
                ].map(({ id, icon, t, s }) => (
                  <button key={id} onClick={() => setTab(id)} style={{ ...C.card, textAlign: 'left', color: 'white', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{t}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{s}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── JD ANALYSER ── */}
          {tab === 'analyser' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>JD <span style={gT}>Analyser</span></h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Paste any job description. Get a match score, tailored summary, and a ready-to-send cover letter.</p>
              </div>
              <div style={{ ...C.card, marginBottom: 16 }}>
                <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the full job description here..." rows={7} style={{ ...C.inp, resize: 'vertical', lineHeight: 1.7 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={analyseJD} disabled={analysing || !jd.trim()} style={{ ...C.btn, opacity: analysing ? 0.5 : 1, cursor: analysing ? 'not-allowed' : 'pointer' }}>
                    {analysing ? '↻ Analysing...' : '◈ Analyse Job Description'}
                  </button>
                  {jd && <button onClick={() => { setJd(''); setAnalysis(null); setAErr('') }} style={C.ghost}>Clear</button>}
                </div>
                {aErr && <div style={{ marginTop: 10, color: '#F87171', fontSize: 12 }}>{aErr}</div>}
              </div>
              {analysis && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ ...C.card, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'center', flexShrink: 0, padding: '0 6px' }}>
                      <div style={{ fontSize: 40, fontWeight: 800, ...gT, lineHeight: 1 }}>{analysis.matchScore}%</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.36)', marginTop: 3 }}>Profile Match</div>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 20, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{analysis.jobTitle}{analysis.company && analysis.company !== 'Unknown' ? ` · ${analysis.company}` : ''}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {(analysis.matchedSkills || []).map(s => <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(124,58,237,0.18)', color: '#C4B5FD', fontWeight: 500 }}>{s}</span>)}
                        {(analysis.gaps || []).map(g => <span key={g} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(248,113,113,0.12)', color: '#FCA5A5' }}>⚠ {g}</span>)}
                      </div>
                    </div>
                  </div>
                  <div style={C.card}>
                    <div style={C.sec}>Tailored Summary</div>
                    <p style={{ fontSize: 12, lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>{analysis.tailoredSummary}</p>
                  </div>
                  <div style={C.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={C.sec}>Cover Letter</div>
                      <button onClick={() => copyText(analysis.coverLetter)} style={{ ...C.ghost, padding: '4px 10px', fontSize: 10 }}>{copied ? 'Copied ✓' : 'Copy ↗'}</button>
                    </div>
                    <p style={{ fontSize: 12, lineHeight: 1.9, color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap' }}>{analysis.coverLetter}</p>
                  </div>
                  {(analysis.keyTalkingPoints || []).length > 0 && (
                    <div style={C.card}>
                      <div style={C.sec}>Key Talking Points</div>
                      {analysis.keyTalkingPoints.map((pt, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ ...gT, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)', lineHeight: 1.6 }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => goToTracker(analysis.company, analysis.jobTitle)} style={{ ...C.ghost, textAlign: 'left', fontSize: 12 }}>+ Log to Application Tracker →</button>
                </div>
              )}
            </div>
          )}

          {/* ── TRACKER ── */}
          {tab === 'tracker' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Application <span style={gT}>Tracker</span></h1>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>{apps.length} application{apps.length !== 1 ? 's' : ''} tracked</p>
                </div>
                <button onClick={() => setShowForm(v => !v)} style={C.btn}>+ New Application</button>
              </div>
              {showForm && (
                <div style={{ ...C.card, marginBottom: 16, borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.07)' }}>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12 }}>Add Application</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <input placeholder="Company *"   value={newApp.company} onChange={e => setNewApp(p => ({ ...p, company: e.target.value }))} style={C.inp} />
                    <input placeholder="Job Title *" value={newApp.role}    onChange={e => setNewApp(p => ({ ...p, role: e.target.value }))}    style={C.inp} />
                    <input type="date" value={newApp.date} onChange={e => setNewApp(p => ({ ...p, date: e.target.value }))} style={{ ...C.inp, colorScheme: 'dark' }} />
                    <input placeholder="URL (optional)" value={newApp.url} onChange={e => setNewApp(p => ({ ...p, url: e.target.value }))} style={C.inp} />
                  </div>
                  <input placeholder="Notes (optional)" value={newApp.notes} onChange={e => setNewApp(p => ({ ...p, notes: e.target.value }))} style={{ ...C.inp, marginBottom: 12 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={addApp} style={C.btn}>Add</button>
                    <button onClick={() => setShowForm(false)} style={C.ghost}>Cancel</button>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {apps.map(a => (
                  <div key={a.id} style={{ ...C.card, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: ST[a.status]?.b, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {a.status === 'Applied' ? '📬' : a.status === 'Interview' ? '💬' : a.status === 'Offer' ? '🎉' : '📁'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{a.company}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.36)', marginTop: 1 }}>{a.role}</div>
                      {a.notes && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.24)', marginTop: 1, fontStyle: 'italic' }}>{a.notes}</div>}
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.26)', flexShrink: 0 }}>{a.date}</span>
                    {followups.some(f => f.appId === a.id && (f.status === 'pending' || f.status === 'drafted')) && (
                      <span title="Follow-up pending" style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(251,146,60,0.15)', color: '#FB923C', flexShrink: 0, whiteSpace: 'nowrap' }}>↗ Follow-up</span>
                    )}
                    <select value={a.status} onChange={e => updStatus(a.id, e.target.value)} style={{ background: ST[a.status]?.b, border: 'none', borderRadius: 20, padding: '3px 10px', color: ST[a.status]?.c, fontWeight: 600, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
                      {Object.keys(ST).map(s => <option key={s} value={s} style={{ background: '#1a1a2e', color: 'white' }}>{s}</option>)}
                    </select>
                    <button onClick={() => delApp(a.id)} style={{ fontSize: 13, color: 'rgba(248,113,113,0.6)', padding: 3, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
                {apps.length === 0 && (
                  <div style={{ ...C.card, textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>No applications yet</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Add your first application or analyse a JD to get started.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── INTERVIEW PREP ── */}
          {tab === 'interview' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Interview <span style={gT}>Prep</span></h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Paste any job description. Get 6 targeted questions with STAR-format answers using your real experience.</p>
              </div>
              <div style={{ ...C.card, marginBottom: 16 }}>
                <textarea value={iJd} onChange={e => setIJd(e.target.value)} placeholder="Paste the job description to generate tailored interview questions..." rows={6} style={{ ...C.inp, resize: 'vertical', lineHeight: 1.7 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={genQuestions} disabled={generating || !iJd.trim()} style={{ ...C.btn, opacity: generating ? 0.5 : 1, cursor: generating ? 'not-allowed' : 'pointer' }}>
                    {generating ? '↻ Generating...' : '◎ Generate Questions'}
                  </button>
                  {iJd && <button onClick={() => { setIJd(''); setQs(null); setIErr('') }} style={C.ghost}>Clear</button>}
                </div>
                {iErr && <div style={{ marginTop: 10, color: '#F87171', fontSize: 12 }}>{iErr}</div>}
              </div>
              {qs && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(qs.questions || []).map((q, i) => (
                    <div key={i} onClick={() => setOpenQ(openQ === i ? null : i)} style={{ ...C.card, padding: '14px 18px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, ...gT, flexShrink: 0 }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 5, lineHeight: 1.5 }}>{q.question}</div>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: 'rgba(192,132,252,0.15)', color: '#C084FC', fontWeight: 500 }}>{q.type}</span>
                            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>{q.difficulty}</span>
                          </div>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, flexShrink: 0 }}>{openQ === i ? '▲' : '▼'}</span>
                      </div>
                      {openQ === i && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                          <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Suggested Answer (STAR Format)</div>
                          <p style={{ fontSize: 12, lineHeight: 1.85, color: 'rgba(255,255,255,0.76)' }}>{q.suggestedAnswer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>My <span style={gT}>Profile</span></h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Your professional data powering every AI feature in JobAgent.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ ...C.card, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>MV</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{MICHAEL.name}</div>
                    <div style={{ fontSize: 12, ...gT, fontWeight: 600, marginBottom: 4 }}>{MICHAEL.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{MICHAEL.location} · {MICHAEL.email}</div>
                  </div>
                </div>
                <div style={C.card}>
                  <div style={C.sec}>Summary</div>
                  <p style={{ fontSize: 11, lineHeight: 1.75, color: 'rgba(255,255,255,0.62)' }}>{MICHAEL.summary.slice(0, 260)}…</p>
                </div>
                <div style={C.card}>
                  <div style={C.sec}>Languages</div>
                  {MICHAEL.languages.map(l => (
                    <div key={l.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontWeight: 600, fontSize: 12 }}>{l.l}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>{l.lb} · {l.lv}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...C.card, gridColumn: '1 / -1' }}>
                  <div style={C.sec}>Core Competencies</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {MICHAEL.skills.map(s => <span key={s} style={{ fontSize: 10, padding: '4px 11px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.62)' }}>{s}</span>)}
                  </div>
                </div>
                <div style={{ ...C.card, gridColumn: '1 / -1' }}>
                  <div style={C.sec}>Experience</div>
                  {MICHAEL.experience.map((e, i) => (
                    <div key={i} style={{ padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{e.company}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>{e.period}</span>
                      </div>
                      <div style={{ fontSize: 11, ...gT, fontWeight: 500, marginBottom: 4 }}>{e.role}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{e.bullets[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── FOLLOW-UPS ── */}
          {tab === 'followups' && (() => {
            const FU_TYPE = {
              'applied-followup':  { label: 'Application Follow-up', color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
              'interview-thankyou':{ label: 'Interview Thank-you',   color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
              'rejection-response':{ label: 'Rejection Response',    color: '#C084FC', bg: 'rgba(192,132,252,0.12)' },
            }
            const pending  = followups.filter(f => f.status === 'pending')
            const drafted  = followups.filter(f => f.status === 'drafted')
            const sent     = followups.filter(f => f.status === 'sent')
            const weekAgo  = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
            const sentThisWeek = sent.filter(f => f.createdAt >= weekAgo).length
            const responseRate = sent.length === 0 ? 0 : Math.round((sent.filter(f => apps.find(a => a.id === f.appId)?.status === 'Interview').length / sent.length) * 100)

            const FuCard = ({ fu }) => {
              const meta = FU_TYPE[fu.type] || FU_TYPE['applied-followup']
              const isExpanded = fuExpanded[fu.id]
              const isDrafting = fuDrafting[fu.id]
              const isSending  = fuSending[fu.id]

              // Local draft state — bound to inputs so keystrokes never re-render parent
              const [localTo,      setLocalTo]      = React.useState(fu.recipientEmail || '')
              const [localSubject, setLocalSubject] = React.useState(fu.draftedEmail?.subject || '')
              const [localBody,    setLocalBody]    = React.useState(fu.draftedEmail?.body    || '')

              // Sync local state when draftedEmail changes (e.g. after AI draft completes)
              React.useEffect(() => { setLocalSubject(fu.draftedEmail?.subject || '') }, [fu.draftedEmail?.subject])
              React.useEffect(() => { setLocalBody(fu.draftedEmail?.body    || '') }, [fu.draftedEmail?.body])
              React.useEffect(() => { setLocalTo(fu.recipientEmail || '') },           [fu.recipientEmail])
              return (
                <div style={{ ...C.card, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{fu.company}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>{fu.role}</div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: meta.bg, color: meta.color }}>{meta.label}</span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Due</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: fu.dueDate < new Date().toISOString().slice(0,10) && fu.status !== 'sent' ? '#F87171' : 'rgba(255,255,255,0.6)' }}>{fu.dueDate}</div>
                    </div>
                  </div>

                  {/* Expanded email preview */}
                  {isExpanded && fu.draftedEmail && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>To: Recruiter Email</div>
                      <input
                        value={localTo}
                        onChange={e => setLocalTo(e.target.value)}
                        onBlur={e => updateFollowupDraft(fu.id, 'recipientEmail', e.target.value)}
                        placeholder="recruiter@company.com"
                        name={`recruiterEmail-${fu.id}`}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-form-type="other"
                        style={{ ...C.inp, fontSize: 12, marginBottom: 10, borderColor: !localTo.trim() ? 'rgba(248,113,113,0.5)' : undefined }}
                      />
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Subject</div>
                      <input
                        value={localSubject}
                        onChange={e => setLocalSubject(e.target.value)}
                        onBlur={e => updateFollowupDraft(fu.id, 'subject', e.target.value)}
                        autoComplete="off"
                        data-form-type="other"
                        style={{ ...C.inp, fontSize: 12, marginBottom: 10 }}
                      />
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Body</div>
                      <textarea
                        value={localBody}
                        onChange={e => setLocalBody(e.target.value)}
                        onBlur={e => updateFollowupDraft(fu.id, 'body', e.target.value)}
                        rows={8}
                        style={{ ...C.inp, fontSize: 12, resize: 'vertical', lineHeight: 1.6 }}
                      />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {fu.status !== 'sent' && (
                      <button onClick={() => draftFollowup(fu.id)} disabled={isDrafting} style={{ ...C.btn, fontSize: 11, padding: '7px 14px', opacity: isDrafting ? 0.6 : 1 }}>
                        {isDrafting ? '↻ Drafting…' : '✦ Draft with AI'}
                      </button>
                    )}
                    {fu.draftedEmail && fu.status !== 'sent' && (
                      <>
                        <button onClick={() => setFuExpanded(p => ({ ...p, [fu.id]: !p[fu.id] }))} style={{ ...C.ghost, fontSize: 11, padding: '7px 14px' }}>
                          {isExpanded ? 'Hide Draft' : 'Review Draft'}
                        </button>
                        <button onClick={() => sendFollowup(fu.id)} disabled={isSending} style={{ ...C.btn, fontSize: 11, padding: '7px 14px', opacity: isSending ? 0.6 : 1 }}>
                          {isSending ? '↻ Sending…' : '↗ Send'}
                        </button>
                      </>
                    )}
                    {fu.status === 'sent' && (
                      <span style={{ fontSize: 11, color: '#34D399', padding: '7px 0', display: 'flex', alignItems: 'center', gap: 5 }}>✓ Sent</span>
                    )}
                    <button onClick={() => setFollowups(p => p.filter(f => f.id !== fu.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 11, cursor: 'pointer', marginLeft: 'auto', padding: '7px 0' }}>
                      Dismiss
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Smart <span style={gT}>Follow-ups</span></h1>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>AI-drafted follow-up emails auto-detected from your tracker.</p>
                </div>

                {/* Stats bar */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
                  {[
                    { label: 'Pending',       value: pending.length,  color: '#FB923C' },
                    { label: 'Sent this week', value: sentThisWeek,   color: '#34D399' },
                    { label: 'Response rate',  value: responseRate + '%', color: '#C084FC' },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, ...C.card, textAlign: 'center', padding: '14px 10px' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Pending */}
                {pending.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#FB923C', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      ● Needs Attention <span style={{ color: 'rgba(255,255,255,0.25)' }}>{pending.length}</span>
                    </div>
                    {pending.map(fu => <FuCard key={fu.id} fu={fu} />)}
                  </div>
                )}

                {/* Drafted */}
                {drafted.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#60A5FA', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      ● Ready to Send <span style={{ color: 'rgba(255,255,255,0.25)' }}>{drafted.length}</span>
                    </div>
                    {drafted.map(fu => <FuCard key={fu.id} fu={fu} />)}
                  </div>
                )}

                {/* Sent */}
                {sent.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#34D399', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      ● Sent <span style={{ color: 'rgba(255,255,255,0.25)' }}>{sent.length}</span>
                    </div>
                    {sent.map(fu => <FuCard key={fu.id} fu={fu} />)}
                  </div>
                )}

                {followups.length === 0 && (
                  <div style={{ ...C.card, textAlign: 'center', padding: 52 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>✉</div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>No follow-ups yet</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', maxWidth: 320, margin: '0 auto' }}>
                      Follow-ups are auto-detected from your Applications tracker — applied 7+ days ago, interviews, and rejections will appear here automatically.
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── GMAIL AGENT ── */}
          {tab === 'gmail' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Gmail <span style={gT}>Agent</span></h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Connect your inbox to scan for job-related emails and draft AI-powered replies.</p>
              </div>

              {!gmailToken && (
                <div style={{ ...C.card, textAlign: 'center', padding: 52 }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>✉</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Connect your Gmail</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
                    Authorise read-only access. JobAgent will scan for job-related emails and help you craft professional replies.
                  </div>
                  <button onClick={connectGmail} style={{ ...C.btn, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span>✉</span> Connect Gmail
                  </button>
                  {gmailErr && <div style={{ marginTop: 14, color: '#F87171', fontSize: 12 }}>{gmailErr}</div>}
                </div>
              )}

              {gmailToken && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(52,211,153,0.12)', color: '#34D399', fontWeight: 600 }}>● Connected</span>
                      {gmailUser && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{gmailUser}</span>}
                    </div>
                    <button onClick={() => scanInbox(gmailToken)} disabled={gmailLoading} style={{ ...C.ghost, fontSize: 11, padding: '6px 14px', opacity: gmailLoading ? 0.5 : 1, cursor: gmailLoading ? 'not-allowed' : 'pointer' }}>
                      {gmailLoading ? '↻ Scanning...' : '↻ Rescan Inbox'}
                    </button>
                  </div>

                  {gmailLoading && (
                    <div style={{ ...C.card, textAlign: 'center', padding: 40 }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>↻ Scanning inbox for job-related emails…</div>
                    </div>
                  )}

                  {!gmailLoading && gmailEmails.length === 0 && (
                    <div style={{ ...C.card, textAlign: 'center', padding: 40 }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>No job emails found</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Try rescanning or check that your inbox has relevant emails.</div>
                    </div>
                  )}

                  {!gmailLoading && gmailEmails.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>{gmailEmails.length} job-related emails found</div>
                      {gmailEmails.map(email => (
                        <div key={email.id} style={C.card}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }} onClick={() => setOpenEmail(openEmail === email.id ? null : email.id)}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, fontSize: 12, color: 'white' }}>{email.subject || '(no subject)'}</span>
                                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: EMAIL_ST[email.status]?.b, color: EMAIL_ST[email.status]?.c, fontWeight: 600, flexShrink: 0 }}>{email.status}</span>
                              </div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{email.from}</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.5 }}>{email.snippet?.slice(0, 120)}{email.snippet?.length > 120 ? '…' : ''}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.24)', whiteSpace: 'nowrap' }}>
                                {email.date ? new Date(email.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10 }}>{openEmail === email.id ? '▲' : '▼'}</span>
                            </div>
                          </div>

                          {openEmail === email.id && (
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 14 }}>{email.snippet}</div>
                              {!replyDrafts[email.id] ? (
                                <button
                                  onClick={() => draftReply(email.id, email.from, email.subject, email.snippet)}
                                  disabled={replyLoading[email.id]}
                                  style={{ ...C.btn, fontSize: 11, padding: '7px 16px', opacity: replyLoading[email.id] ? 0.5 : 1, cursor: replyLoading[email.id] ? 'not-allowed' : 'pointer' }}
                                >
                                  {replyLoading[email.id] ? '↻ Drafting…' : '✦ Draft AI Reply'}
                                </button>
                              ) : (
                                <div>
                                  <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>AI-Drafted Reply</div>
                                  <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.76)', lineHeight: 1.85, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{replyDrafts[email.id]}</div>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => copyText(replyDrafts[email.id])} style={{ ...C.ghost, fontSize: 10, padding: '5px 12px' }}>{copied ? 'Copied ✓' : 'Copy ↗'}</button>
                                    <button onClick={() => setReplyDrafts(p => { const n = { ...p }; delete n[email.id]; return n })} style={{ ...C.ghost, fontSize: 10, padding: '5px 12px' }}>Regenerate</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {gmailErr && <div style={{ marginTop: 14, color: '#F87171', fontSize: 12 }}>{gmailErr}</div>}
                </div>
              )}
            </div>
          )}

          {/* ── INTELLIGENCE ── */}
          {tab === 'intelligence' && (() => {
            const skills = intelSkillFreq(intelJobs)
            const maxFreq = skills[0]?.[1] || 1
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Job Market <span style={gT}>Intelligence</span></h1>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>
                      {intelScannedAt ? `Last scanned ${new Date(intelScannedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Never scanned — run your first scan below.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {intelJobs.length > 0 && (
                      <button onClick={() => intelDigest(intelJobs)} style={{ ...C.ghost, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>✉ Daily Digest</button>
                    )}
                    <button onClick={scanIntelligence} disabled={intelLoading} style={{ ...C.btn, fontSize: 12, opacity: intelLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 7, minWidth: 130 }}>
                      {intelLoading ? <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>↻</span> Scanning…</> : '◎ Scan Now'}
                    </button>
                  </div>
                </div>

                {intelErr && <div style={{ color: '#F87171', fontSize: 12, marginBottom: 16, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>{intelErr}</div>}

                {intelLoading && (
                  <div style={{ ...C.card, textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 28, marginBottom: 12, animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>◎</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Searching the web for live job listings…</div>
                  </div>
                )}

                {!intelLoading && intelJobs.length > 0 && (
                  <>
                    {/* ── Job cards ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                      {intelJobs.map((job, i) => {
                        const score = job.matchScore || 0
                        const glow = score >= 70 ? '0 0 0 1px rgba(52,211,153,0.5), 0 0 16px rgba(52,211,153,0.08)'
                                   : score >= 40 ? '0 0 0 1px rgba(251,191,36,0.4), 0 0 16px rgba(251,191,36,0.06)'
                                   : '0 0 0 1px rgba(255,255,255,0.07)'
                        const scoreColor = score >= 70 ? '#34D399' : score >= 40 ? '#FBBF24' : 'rgba(255,255,255,0.35)'
                        return (
                          <div key={i} style={{ ...C.card, boxShadow: glow, padding: '18px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>{job.title}</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
                                  {job.company} · {job.location}
                                  {job.salaryRange && job.salaryRange !== 'Not specified' && <span style={{ marginLeft: 8, color: '#C4B5FD' }}>{job.salaryRange}</span>}
                                  {job.postedDate && <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.28)' }}>Posted {job.postedDate}</span>}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 10 }}>{job.matchReason}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                  {(job.keyRequirements || []).map((r, ri) => (
                                    <span key={ri} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: '#C4B5FD' }}>{r}</span>
                                  ))}
                                </div>
                              </div>
                              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}<span style={{ fontSize: 14 }}>%</span></div>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: 0.8 }}>MATCH</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 7, marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                              <button onClick={() => { setAnalysis(null); setAErr(''); setJd(`${job.title} at ${job.company}\n${job.location}\n\n${(job.keyRequirements || []).join(', ')}\n\n${job.matchReason}`); setTab('analyser') }} style={{ ...C.ghost, fontSize: 11, padding: '6px 14px' }}>◈ Analyse</button>
                              <button onClick={() => { setApps(p => p.some(a => a.url === job.applyUrl) ? p : [{ id: Date.now(), company: job.company, role: job.title, date: today, status: 'Applied', notes: '', url: job.applyUrl || '' }, ...p]); showToast(`✓ "${job.title}" logged to tracker`); setQueuePrompt({ title: job.title, company: job.company, url: job.applyUrl || '', platform: job.applyUrl?.includes('linkedin') ? 'LinkedIn' : 'Other', matchScore: job.matchScore || 0 }) }} style={{ ...C.ghost, fontSize: 11, padding: '6px 14px' }}>◉ Log</button>
                              {job.applyUrl && <button onClick={() => window.open(job.applyUrl, '_blank')} style={{ ...C.btn, fontSize: 11, padding: '6px 14px' }}>Apply →</button>}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* ── Market Trends ── */}
                    {skills.length > 0 && (
                      <div style={{ ...C.card }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>Top Requested Skills</div>
                        <svg width="100%" height={skills.length * 36} style={{ overflow: 'visible' }}>
                          {skills.map(([skill, count], i) => {
                            const barW = `${Math.round((count / maxFreq) * 72)}%`
                            const y = i * 36
                            return (
                              <g key={skill}>
                                <text x="0" y={y + 14} fill="rgba(255,255,255,0.65)" fontSize="12" fontFamily="system-ui">{skill}</text>
                                <rect x="0" y={y + 20} width={barW} height="8" rx="4" fill="url(#ig)" />
                                <text x={barW} y={y + 28} dx="6" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="system-ui">{count}×</text>
                              </g>
                            )
                          })}
                          <defs>
                            <linearGradient id="ig" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#7C3AED" />
                              <stop offset="50%" stopColor="#DB2777" />
                              <stop offset="100%" stopColor="#F97316" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}
                  </>
                )}

                {!intelLoading && intelJobs.length === 0 && !intelErr && (
                  <div style={{ ...C.card, textAlign: 'center', padding: 56 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>◎</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No results yet</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Click Scan Now to search for live job matches using AI + web search.</div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (() => {
            const tagStyle    = { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)', color: '#C4B5FD', fontWeight: 500 }
            const presetStyle = { fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit' }
            const sLabel      = { fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10, display: 'block' }
            const sec         = { marginBottom: 26 }
            const selOpt      = (on) => ({ fontSize: 12, padding: '7px 14px', borderRadius: 10, background: on ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${on ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`, color: on ? '#C4B5FD' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: on ? 600 : 400 })
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Agent <span style={gT}>Settings</span></h1>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Edit your preferences at any time.</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setDraft({ ...config })} style={{ ...C.ghost, fontSize: 12 }}>Reset</button>
                    <button onClick={() => saveConfig(draft)} style={{ ...C.btn, fontSize: 12 }}>Save Changes</button>
                  </div>
                </div>

                {/* Job Preferences */}
                <div style={{ ...C.card, marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, ...gT, display: 'inline-block' }}>Job Preferences</div>

                  <div style={sec}>
                    <span style={sLabel}>Target Job Titles</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {draft.jobTitles.map(t => <span key={t} style={tagStyle}>{t} <button onClick={() => dRemoveTag('jobTitles', t)} style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button></span>)}
                      {PRESET_TITLES.filter(t => !draft.jobTitles.includes(t)).map(t => <button key={t} onClick={() => dAddPreset('jobTitles', t)} style={presetStyle}>+ {t}</button>)}
                    </div>
                    <input value={wInput.title} onChange={e => setWInput(i => ({ ...i, title: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dAddTag('jobTitles', 'title') } }} placeholder="Type custom title + Enter" style={{ ...C.inp, fontSize: 12 }} />
                  </div>

                  <div style={sec}>
                    <span style={sLabel}>Target Industries</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {draft.industries.map(t => <span key={t} style={tagStyle}>{t} <button onClick={() => dRemoveTag('industries', t)} style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button></span>)}
                      {PRESET_INDUSTRIES.filter(t => !draft.industries.includes(t)).map(t => <button key={t} onClick={() => dAddPreset('industries', t)} style={presetStyle}>+ {t}</button>)}
                    </div>
                    <input value={wInput.industry} onChange={e => setWInput(i => ({ ...i, industry: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dAddTag('industries', 'industry') } }} placeholder="Type custom industry + Enter" style={{ ...C.inp, fontSize: 12 }} />
                  </div>

                  <div style={sec}>
                    <span style={sLabel}>Preferred Locations</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {draft.locations.map(t => <span key={t} style={tagStyle}>{t} <button onClick={() => dRemoveTag('locations', t)} style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button></span>)}
                      {PRESET_LOCATIONS.filter(t => !draft.locations.includes(t)).map(t => <button key={t} onClick={() => dAddPreset('locations', t)} style={presetStyle}>+ {t}</button>)}
                    </div>
                    <input value={wInput.location} onChange={e => setWInput(i => ({ ...i, location: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dAddTag('locations', 'location') } }} placeholder="Type custom location + Enter" style={{ ...C.inp, fontSize: 12 }} />
                  </div>

                  <div style={sec}>
                    <span style={sLabel}>Salary Range</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <select value={draft.salaryMin} onChange={e => setDraft(d => ({ ...d, salaryMin: +e.target.value }))} style={{ ...C.inp, width: 'auto', cursor: 'pointer' }}>
                        {SALARY_OPTIONS.filter(s => s < draft.salaryMax).map(s => <option key={s} value={s}>€{s}k</option>)}
                      </select>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</span>
                      <select value={draft.salaryMax} onChange={e => setDraft(d => ({ ...d, salaryMax: +e.target.value }))} style={{ ...C.inp, width: 'auto', cursor: 'pointer' }}>
                        {SALARY_OPTIONS.filter(s => s > draft.salaryMin).map(s => <option key={s} value={s}>€{s}k</option>)}
                      </select>
                      <span style={{ fontSize: 13, ...gT, fontWeight: 700 }}>€{draft.salaryMin}k – €{draft.salaryMax}k</span>
                    </div>
                  </div>

                  <div style={{ ...sec, marginBottom: 0 }}>
                    <span style={sLabel}>Job Type</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {JOB_TYPES.map(t => <button key={t} onClick={() => dToggleArr('jobTypes', t)} style={selOpt(draft.jobTypes.includes(t))}>{draft.jobTypes.includes(t) ? '✓ ' : ''}{t}</button>)}
                    </div>
                  </div>
                </div>

                {/* Search Settings */}
                <div style={{ ...C.card, marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, ...gT, display: 'inline-block' }}>Search Settings</div>

                  <div style={sec}>
                    <span style={sLabel}>Email Detection Keywords</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {draft.keywords.map(k => <span key={k} style={tagStyle}>{k} <button onClick={() => dRemoveTag('keywords', k)} style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button></span>)}
                    </div>
                    <input value={wInput.keyword} onChange={e => setWInput(i => ({ ...i, keyword: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); dAddTag('keywords', 'keyword') } }} placeholder="Add keyword + Enter" style={{ ...C.inp, fontSize: 12 }} />
                  </div>

                  <div style={sec}>
                    <span style={sLabel}>Language Preferences</span>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {LANG_OPTIONS.map(l => <button key={l} onClick={() => dToggleArr('languages', l)} style={{ ...selOpt(draft.languages.includes(l)), padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>{l}</button>)}
                    </div>
                  </div>

                  <div style={{ ...sec, marginBottom: 0 }}>
                    <span style={sLabel}>Auto-Scan Frequency</span>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {SCAN_OPTIONS.map(opt => <button key={opt} onClick={() => setDraft(d => ({ ...d, scanFrequency: opt }))} style={selOpt(draft.scanFrequency === opt)}>{draft.scanFrequency === opt ? '● ' : '○ '}{opt}</button>)}
                    </div>
                  </div>
                </div>

                {/* Agent Behaviour */}
                <div style={{ ...C.card, marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, ...gT, display: 'inline-block' }}>Agent Behaviour</div>
                  {[
                    { field: 'autoDraft',      title: 'Auto-draft Replies',         desc: 'Automatically generate AI reply drafts for job emails' },
                    { field: 'autoLog',         title: 'Auto-log to Tracker',        desc: 'Automatically add detected job emails to the Application Tracker' },
                    { field: 'interviewAlerts', title: 'Interview Detection Alerts', desc: 'Highlight and alert when an interview request is detected' },
                  ].map(({ field, title, desc }) => (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{desc}</div>
                      </div>
                      <Toggle on={draft[field]} onToggle={() => dToggle(field)} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setDraft({ ...config })} style={{ ...C.ghost, fontSize: 12 }}>Reset to Saved</button>
                  <button onClick={() => saveConfig(draft)} style={{ ...C.btn, fontSize: 12 }}>Save Changes</button>
                </div>
              </div>
            )
          })()}

          {/* ── AUTO-APPLY ── */}
          {tab === 'autoapply' && (() => {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            const totalQueued   = autoQueue.filter(j => j.status !== 'skipped').length
            const totalPrepared = autoQueue.filter(j => j.status === 'prepared').length
            const totalApplied  = autoQueue.filter(j => j.status === 'applied' && j.dateAdded >= weekAgo).length
            const FORM_LABELS = {
              whyThisRole:        'Why this role?',
              describeExperience: 'Describe your experience',
              salaryExpectation:  'Salary expectation',
              availability:       'Availability',
              whyThisCompany:     'Why this company?',
            }
            return (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Auto-Apply <span style={gT}>Queue</span></h1>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>Prepare cover letters and form answers, then apply in one click.</p>
                </div>

                {/* Stats bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
                  {[
                    { l: 'In Queue',        v: totalQueued,   e: '⚡' },
                    { l: 'Prepared',        v: totalPrepared, e: '✓' },
                    { l: 'Applied (7d)',    v: totalApplied,  e: '🚀' },
                  ].map(({ l, v, e }) => (
                    <div key={l} style={{ ...C.card, textAlign: 'center', padding: 16 }}>
                      <div style={{ fontSize: 18, marginBottom: 6 }}>{e}</div>
                      <div style={{ fontSize: 26, fontWeight: 700, ...gT }}>{v}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.36)', marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)' }}>{totalQueued} job{totalQueued !== 1 ? 's' : ''} in queue</div>
                  <button onClick={() => setAutoAddForm(v => !v)} style={{ ...C.btn, fontSize: 12, padding: '8px 18px' }}>+ Add to Queue</button>
                </div>

                {/* Add to queue form */}
                {autoAddForm && (
                  <div style={{ ...C.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, ...gT, display: 'inline-block' }}>Add Job to Queue</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <input value={autoNewJob.title} onChange={e => setAutoNewJob(j => ({ ...j, title: e.target.value }))} placeholder="Job title" style={{ ...C.inp, fontSize: 12 }} />
                      <input value={autoNewJob.company} onChange={e => setAutoNewJob(j => ({ ...j, company: e.target.value }))} placeholder="Company" style={{ ...C.inp, fontSize: 12 }} />
                    </div>
                    <input value={autoNewJob.url} onChange={e => setAutoNewJob(j => ({ ...j, url: e.target.value }))} placeholder="Job URL" style={{ ...C.inp, fontSize: 12, marginBottom: 10 }} />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select value={autoNewJob.platform} onChange={e => setAutoNewJob(j => ({ ...j, platform: e.target.value }))} style={{ ...C.inp, fontSize: 12, width: 'auto' }}>
                        {['LinkedIn', 'WTTJ', 'Indeed', 'Glassdoor', 'StepStone', 'Other'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button onClick={() => {
                        if (!autoNewJob.title.trim() || !autoNewJob.company.trim()) return
                        addToAutoQueue(autoNewJob)
                        setAutoNewJob({ title: '', company: '', url: '', platform: 'LinkedIn' })
                        setAutoAddForm(false)
                      }} style={{ ...C.btn, fontSize: 12, padding: '9px 18px' }}>Add</button>
                      <button onClick={() => setAutoAddForm(false)} style={{ ...C.ghost, fontSize: 12, padding: '9px 14px' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Job cards */}
                {autoQueue.filter(j => j.status !== 'skipped').length === 0 && (
                  <div style={{ ...C.card, textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.28)', fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
                    <div>No jobs in queue.</div>
                    <div style={{ fontSize: 11, marginTop: 6 }}>Add jobs manually or use the Log button in the Intelligence tab.</div>
                  </div>
                )}

                {autoQueue.filter(j => j.status !== 'skipped').map(job => {
                  const isPrepping = autoPrepping.has(job.id)
                  const expandedCover = autoExpanded[`${job.id}-cover`]
                  const expandedForm  = autoExpanded[`${job.id}-form`]
                  const toggle = (key) => setAutoExpanded(e => ({ ...e, [key]: !e[key] }))
                  const statusColor = job.status === 'prepared' ? '#34D399' : job.status === 'applied' ? '#818CF8' : 'rgba(255,255,255,0.3)'
                  const platformColor = job.platform === 'LinkedIn' ? '#0A66C2' : job.platform === 'WTTJ' ? '#3DDC84' : 'rgba(255,255,255,0.2)'
                  return (
                    <div key={job.id} style={{ ...C.card, marginBottom: 12 }}>
                      {/* Card header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{job.title}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: platformColor, color: 'white' }}>{job.platform}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: statusColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>{job.status}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{job.company}{job.dateAdded ? ` · ${job.dateAdded}` : ''}</div>
                        </div>
                        {job.matchScore > 0 && (
                          <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: 12 }}>
                            <div style={{ fontSize: 22, fontWeight: 800, ...gT, lineHeight: 1 }}>{job.matchScore}<span style={{ fontSize: 11 }}>%</span></div>
                            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.8 }}>MATCH</div>
                          </div>
                        )}
                      </div>

                      {/* Cover letter expander */}
                      <div style={{ marginBottom: 8 }}>
                        <button onClick={() => toggle(`${job.id}-cover`)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {expandedCover ? '▾' : '▸'} Cover Letter {job.coverLetter ? '✓' : '(not generated)'}
                        </button>
                        {expandedCover && (
                          <div style={{ marginTop: 8, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-wrap' }}>
                            {job.coverLetter || <span style={{ color: 'rgba(255,255,255,0.25)' }}>Click "Prepare with AI" to generate.</span>}
                          </div>
                        )}
                      </div>

                      {/* Form answers expander */}
                      <div style={{ marginBottom: 14 }}>
                        <button onClick={() => toggle(`${job.id}-form`)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {expandedForm ? '▾' : '▸'} Form Answers {Object.keys(job.formAnswers || {}).length > 0 ? '✓' : '(not generated)'}
                        </button>
                        {expandedForm && (
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {Object.keys(job.formAnswers || {}).length === 0
                              ? <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: 4 }}>Click "Prepare with AI" to generate.</span>
                              : Object.entries(job.formAnswers).map(([k, v]) => (
                                <div key={k} style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                  <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>{FORM_LABELS[k] || k}</div>
                                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{v}</div>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                        <button onClick={() => prepareApplication(job.id)} disabled={isPrepping} style={{ ...C.btn, fontSize: 11, padding: '7px 14px', opacity: isPrepping ? 0.6 : 1 }}>
                          {isPrepping ? '↻ Preparing…' : '✦ Prepare with AI'}
                        </button>
                        {job.url && (
                          <button onClick={() => { window.open(job.url, '_blank'); setAutoQueue(prev => prev.map(j => j.id === job.id ? { ...j, status: 'applied' } : j)) }} style={{ ...C.ghost, fontSize: 11, padding: '7px 14px' }}>
                            Open & Apply →
                          </button>
                        )}
                        {job.coverLetter && (
                          <button onClick={() => navigator.clipboard.writeText(job.coverLetter).then(() => showToast('Cover letter copied', 2000))} style={{ ...C.ghost, fontSize: 11, padding: '7px 14px' }}>
                            Copy Letter
                          </button>
                        )}
                        <button onClick={() => setAutoQueue(prev => prev.map(j => j.id === job.id ? { ...j, status: 'skipped' } : j))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 11, cursor: 'pointer', marginLeft: 'auto', padding: '7px 0' }}>
                          Skip
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Skipped jobs */}
                {autoQueue.some(j => j.status === 'skipped') && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Skipped</div>
                    {autoQueue.filter(j => j.status === 'skipped').map(job => (
                      <div key={job.id} style={{ ...C.card, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.45 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{job.title}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{job.company}</div>
                        </div>
                        <button onClick={() => setAutoQueue(prev => prev.map(j => j.id === job.id ? { ...j, status: 'pending' } : j))} style={{ ...C.ghost, fontSize: 11, padding: '6px 12px' }}>Restore</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

        </div>
      </div>
    </div>
  )
}