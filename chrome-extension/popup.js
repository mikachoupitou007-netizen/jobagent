// ── Michael's profile (used for AI prompts) ──────────────────────────────────
const MICHAEL = {
  name: 'Michael Van Gyseghem',
  title: 'Strategic Sales & Business Development Leader',
  summary: 'Results-oriented Business & Sales Manager with 8+ years of B2B experience spanning (fin)tech, real estate, and international market development. Deep expertise in strategic marketing and business development with a proven ability to penetrate new markets from zero to scale.',
  skills: [
    'Market Penetration Strategy', 'B2B Sales Architecture', 'Franchise Development',
    'Key Account Management', 'Strategic Partnerships', 'P&L Ownership',
    'Cross-Border Negotiations', 'Go-to-Market Planning', 'Revenue Growth & Forecasting',
    'Team Leadership', 'CRM & Sales Analytics',
  ],
  experience: [
    'Self-Employed Real Estate Manager (Jan 2023–Dec 2025, Ljubljana/Slovenia/Italy/Montenegro): Directed end-to-end sales of residential and commercial assets, developed GTM strategies for international portfolios targeting HNW buyers and institutional investors.',
    'We Invest Real Estate – Business Manager Franchise Expansion, Flanders (Dec 2020–Nov 2022): Spearheaded franchise expansion across Flanders, opened and managed 5 flagship agencies, recruited and developed agency directors.',
    'Gamned – Sales Manager KAM (Sep 2019–Mar 2020, Belgium): Drove commercial success of programmatic advertising solutions across Flanders.',
    'Monizze – Key Account Manager (Feb 2017–Jun 2019, Belgium): Led POS activation, growing payment network to 3,000+ terminals across Belgium in 2 years, conducted C-suite negotiations.',
  ],
  languages: 'English C2 (Native), Dutch C2 (Native), French C1 (Fluent), German B2 (Professional)',
  education: 'Ghent University — Business & Commerce',
}

const profileText = () =>
  `Name: ${MICHAEL.name}\nTitle: ${MICHAEL.title}\nSummary: ${MICHAEL.summary}\nSkills: ${MICHAEL.skills.join(', ')}\nExperience:\n${MICHAEL.experience.map(e => '- ' + e).join('\n')}\nLanguages: ${MICHAEL.languages}\nEducation: ${MICHAEL.education}`



// ── State ─────────────────────────────────────────────────────────────────────
let apiKey = ''
let currentJob = null
let outputLanguage = 'EN'


// ── Helpers ──────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id)

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  $(`screen-${name}`).classList.add('active')
}

function setBtn(id, loading, text) {
  const btn = $(id)
  btn.disabled = loading
  btn.innerHTML = loading ? `<span class="spin">↻</span> ${text}` : text
}

function showResult(html) {
  $('result-area').innerHTML = html
  $('result-area').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}


// ── Job data loading ──────────────────────────────────────────────────────────
async function loadJobData() {
  // Check storage first — content.js stores here after deferred extraction completes
  chrome.storage.local.get('jobagent_current_job', ({ jobagent_current_job: stored }) => {
    if (stored?.detected) {
      console.log('[JobAgent popup] loaded from storage:', stored.title, '/', stored.company)
      applyJobData(stored)
      return
    }

    // Fall back to message passing if storage is empty (non-LinkedIn or very fast open)
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return showNotDetected()

      chrome.tabs.sendMessage(tab.id, { type: 'GET_JOB_DATA' }, (response) => {
        if (chrome.runtime.lastError || !response?.detected) {
          showNotDetected()
        } else {
          applyJobData(response)
        }
      })
    })
  })
}

function applyJobData(job) {
  currentJob = job
  $('state-detected').style.display = 'block'
  $('state-not-detected').style.display = 'none'
  $('job-title').textContent = job.title || 'Untitled position'
  $('job-company').textContent = job.company || 'Unknown company'
  $('job-site').textContent = job.site || ''
  $('detection-badge').className = 'detection-badge found'
  $('detection-badge').textContent = `● ${job.site || 'Job'} detected`

  const hasJob = !!(job.title || job.company)
  $('btn-analyse').disabled = !hasJob || !apiKey
  $('btn-log').disabled = !hasJob
  $('btn-cover').disabled = !hasJob || !apiKey
}

function showNotDetected() {
  $('state-detected').style.display = 'none'
  $('state-not-detected').style.display = 'block'
}


// ── Easy Apply ────────────────────────────────────────────────────────────────
let preparedData = null  // { coverLetter, formAnswers } — stored after PREPARE_APPLY

function loadEasyApplyStatus() {
  chrome.storage.local.get('jobagent_easy_apply', ({ jobagent_easy_apply: ea }) => {
    if (ea?.detected) {
      $('easy-apply-section').style.display = 'block'
      $('btn-prepare-apply').style.display = 'flex'
    } else {
      $('easy-apply-section').style.display = 'none'
      $('btn-prepare-apply').style.display = 'none'
    }
  })
}

function prepareAndApply() {
  if (!currentJob) return
  setBtn('btn-prepare-apply', true, 'Preparing…')
  showResult('')

  chrome.storage.sync.get('apiKey', ({ apiKey: key }) => {
    if (!key) {
      showResult('<p class="err">No API key set — open Settings first.</p>')
      setBtn('btn-prepare-apply', false, '⚡ Prepare &amp; Apply')
      return
    }

    chrome.runtime.sendMessage({ type: 'PREPARE_APPLY', apiKey: key, job: currentJob, language: outputLanguage }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        showResult(`<p class="err">Preparation failed: ${chrome.runtime.lastError?.message || response?.error}</p>`)
        setBtn('btn-prepare-apply', false, '⚡ Prepare &amp; Apply')
        return
      }

      preparedData = { coverLetter: response.coverLetter, formAnswers: response.formAnswers }
      const fa = response.formAnswers || {}
      const answersHtml = Object.entries({
        'Why this role': fa.whyThisRole,
        'Experience': fa.describeExperience,
        'Salary expectation': fa.salaryExpectation,
        'Notice period': fa.noticePeriod,
      }).filter(([, v]) => v).map(([q, a]) => `
        <div class="form-answer">
          <div class="form-answer-q">${q}</div>
          <div class="form-answer-a">${a}</div>
        </div>`).join('')

      const letterId = 'cl-' + Date.now()
      showResult(`
        <div class="prepare-box">
          <div class="prepare-label">Cover Letter</div>
          <div class="prepare-text">${response.coverLetter}</div>
          <div style="margin-top:8px;display:flex;gap:6px">
            <button class="btn btn-ghost btn-xs" id="${letterId}-copy">Copy ↗</button>
          </div>
        </div>
        <div class="prepare-box">
          <div class="prepare-label">Form Answers</div>
          ${answersHtml}
        </div>
        <button class="btn btn-primary" id="btn-fill-form" style="margin-bottom:8px">⚡ Fill Form Automatically</button>
      `)

      document.getElementById(`${letterId}-copy`).addEventListener('click', () => {
        navigator.clipboard.writeText(response.coverLetter).catch(() => {})
        document.getElementById(`${letterId}-copy`).textContent = 'Copied ✓'
      })

      document.getElementById('btn-fill-form').addEventListener('click', fillForm)
      setBtn('btn-prepare-apply', false, '⚡ Prepare &amp; Apply')
    })
  })
}

function fillForm() {
  if (!preparedData) return
  const btn = document.getElementById('btn-fill-form')
  if (btn) { btn.disabled = true; btn.textContent = 'Filling…' }

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) return
    console.log('[JobAgent popup] Sending FILL_FORM to tab ID:', tab.id)
    chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM', ...preparedData }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        if (btn) { btn.disabled = false; btn.textContent = '⚡ Fill Form Automatically' }
        const errEl = document.createElement('p')
        errEl.className = 'err'
        errEl.textContent = 'Fill failed: ' + (chrome.runtime.lastError?.message || response?.error || 'Unknown error')
        document.getElementById('result-area').appendChild(errEl)
      } else {
        if (btn) { btn.disabled = false; btn.textContent = '✓ Form Filled!' }
      }
    })
  })
}


// ── Language toggle ───────────────────────────────────────────────────────────
function renderLangToggle() {
  const container = $('lang-toggle')
  if (!container) return
  container.innerHTML = ['EN', 'FR', 'NL'].map(lang => `
    <button class="btn btn-xs ${lang === outputLanguage ? 'btn-primary' : 'btn-ghost'}" data-lang="${lang}" style="flex:1;padding:6px 0">${lang}</button>
  `).join('')
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      outputLanguage = btn.dataset.lang
      chrome.storage.sync.set({ outputLanguage })
      renderLangToggle()
      console.log('[JobAgent popup] Output language set to:', outputLanguage)
    })
  })
}


// ── Analyse with AI ───────────────────────────────────────────────────────────
function analyseJob() {
  if (!currentJob) return
  setBtn('btn-analyse', true, 'Analysing…')
  showResult('')

  chrome.storage.sync.get('apiKey', function (result) {
    const key = result.apiKey || ''
    console.log('API key loaded:', key.length, 'chars, starts with:', key.slice(0, 8))

    if (!key) {
      showResult('<p class="err">No API key set — open Settings and enter your Anthropic key.</p>')
      setBtn('btn-analyse', false, '✦ Analyse with AI')
      return
    }

    const prompt = `You are an expert career coach. Analyse this job description for the candidate and return ONLY valid JSON, no markdown.\n\nCANDIDATE:\n${profileText()}\n\nJOB:\nTitle: ${currentJob.title}\nCompany: ${currentJob.company}\nDescription: ${currentJob.description}\n\nReturn exactly:\n{"matchScore":85,"matchedSkills":["skill1","skill2"],"gaps":["gap1"],"summary":"2-sentence personalised summary of fit using Michael's real experience"}`

    console.log('[JobAgent popup] Sending CALL_ANTHROPIC message — key starts with:', key.slice(0, 8))
    chrome.runtime.sendMessage({ type: 'CALL_ANTHROPIC', apiKey: key, prompt, language: outputLanguage }, function (response) {
      console.log('[JobAgent popup] analyseJob response:', chrome.runtime.lastError || response)
      if (chrome.runtime.lastError) {
        showResult(`<p class="err">Background error: ${chrome.runtime.lastError.message}</p>`)
        setBtn('btn-analyse', false, '✦ Analyse with AI')
        return
      }
      if (!response.ok) {
        showResult(`<p class="err">Analysis failed: ${response.error}</p>`)
        setBtn('btn-analyse', false, '✦ Analyse with AI')
        return
      }

      try {
        const r = JSON.parse(response.text.replace(/```json|```/g, '').trim())
        const matchedHtml = (r.matchedSkills || []).map(s => `<span class="skill-chip chip-match">✓ ${s}</span>`).join('')
        const gapsHtml    = (r.gaps || []).map(g => `<span class="skill-chip chip-gap">⚠ ${g}</span>`).join('')

        showResult(`
          <div class="result-box">
            <div class="result-label">AI Match Analysis</div>
            <div class="result-score">${r.matchScore}%</div>
            <div class="result-score-sub">Profile match</div>
            <div class="skill-chips">${matchedHtml}${gapsHtml}</div>
            <div class="result-text">${r.summary || ''}</div>
            <div class="result-actions">
              <button class="btn btn-ghost btn-xs" id="res-cover-btn">✉ Cover Letter</button>
              <button class="btn btn-ghost btn-xs" id="res-log-btn">+ Log Job</button>
            </div>
          </div>
        `)
        document.getElementById('res-cover-btn').addEventListener('click', generateCoverLetter)
        document.getElementById('res-log-btn').addEventListener('click', () => logJob())
      } catch (e) {
        showResult(`<p class="err">Failed to parse response: ${e.message}</p>`)
      }

      setBtn('btn-analyse', false, '✦ Analyse with AI')
    })
  })
}


// ── Generate Cover Letter ─────────────────────────────────────────────────────
function generateCoverLetter() {
  if (!currentJob) return
  setBtn('btn-cover', true, 'Generating…')
  showResult('')

  chrome.storage.sync.get('apiKey', function (result) {
    const key = result.apiKey || ''
    console.log('API key loaded:', key.length, 'chars, starts with:', key.slice(0, 8))

    if (!key) {
      showResult('<p class="err">No API key set — open Settings and enter your Anthropic key.</p>')
      setBtn('btn-cover', false, '✉ Cover Letter')
      return
    }

    const prompt = `You are an expert career consultant. Write a professional cover letter for ${MICHAEL.name} applying for the role below. Use his real experience. 3 paragraphs, under 250 words. Output only the letter body, no subject line.\n\nCANDIDATE:\n${profileText()}\n\nROLE:\nTitle: ${currentJob.title}\nCompany: ${currentJob.company}\nDescription: ${currentJob.description}`

    console.log('[JobAgent popup] Sending CALL_ANTHROPIC message — key starts with:', key.slice(0, 8))
    chrome.runtime.sendMessage({ type: 'CALL_ANTHROPIC', apiKey: key, prompt, language: outputLanguage }, function (response) {
      console.log('[JobAgent popup] generateCoverLetter response:', chrome.runtime.lastError || response)
      if (chrome.runtime.lastError) {
        showResult(`<p class="err">Background error: ${chrome.runtime.lastError.message}</p>`)
        setBtn('btn-cover', false, '✉ Cover Letter')
        return
      }
      if (!response.ok) {
        showResult(`<p class="err">Generation failed: ${response.error}</p>`)
        setBtn('btn-cover', false, '✉ Cover Letter')
        return
      }

      const letter = response.text
      const id = 'letter-' + Date.now()
      showResult(`
        <div class="result-box">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div class="result-label" style="margin:0">Cover Letter</div>
            <button class="btn btn-ghost btn-xs" id="${id}-copy">Copy ↗</button>
          </div>
          <div class="result-text">${letter.replace(/\n/g, '<br>')}</div>
        </div>
      `)
      document.getElementById(`${id}-copy`).addEventListener('click', () => {
        copyToClipboard(letter)
        document.getElementById(`${id}-copy`).textContent = 'Copied ✓'
      })

      setBtn('btn-cover', false, '✉ Cover Letter')
    })
  })
}


// ── Log to Tracker ────────────────────────────────────────────────────────────
function logJob(job) {
  const j = job || currentJob
  if (!j) return

  const params = new URLSearchParams({
    role:    j.title   || 'Unknown role',
    company: j.company || 'Unknown company',
    date:    new Date().toISOString().slice(0, 10),
    status:  'Applied',
    url:     j.url || '',
  })
  const dashboardUrl = `https://jobagent-mika.vercel.app/?${params.toString()}`

  // Reuse existing dashboard tab if already open, otherwise open new one
  chrome.tabs.query({ url: 'https://jobagent-mika.vercel.app/*' }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { url: dashboardUrl, active: true })
      chrome.windows.update(tabs[0].windowId, { focused: true })
    } else {
      chrome.tabs.create({ url: dashboardUrl })
    }
  })
  showResult('<p class="success">✓ Logging to JobAgent dashboard…</p>')
}


// ── Tracker screen ────────────────────────────────────────────────────────────
function loadTracker() {
  chrome.storage.local.get('trackedJobs', ({ trackedJobs = [] }) => {
    $('jobs-count').textContent = `${trackedJobs.length} job${trackedJobs.length !== 1 ? 's' : ''} tracked`
    const list = $('tracker-list')
    const empty = $('tracker-empty')

    if (!trackedJobs.length) {
      list.innerHTML = ''
      empty.style.display = 'block'
      return
    }
    empty.style.display = 'none'
    list.innerHTML = trackedJobs.map(j => `
      <div class="tracker-item">
        <span class="tracker-status">${j.status}</span>
        <div class="tracker-title">${j.title}</div>
        <div class="tracker-meta">${j.company}${j.site ? ' · ' + j.site : ''} · ${j.date}</div>
      </div>
    `).join('')
  })
}


// ── Settings ──────────────────────────────────────────────────────────────────
function loadSettings() {
  $('settings-key').value = ''
  $('settings-key').placeholder = apiKey ? `Current key ends …${apiKey.slice(-4)} — paste new key to replace` : 'sk-ant-api03-...'
  const hint = $('settings-key-hint')
  if (hint) hint.textContent = apiKey ? `Stored · ends …${apiKey.slice(-4)}` : 'No key saved yet'
  chrome.storage.local.get('trackedJobs', ({ trackedJobs = [] }) => {
    $('jobs-count').textContent = `${trackedJobs.length} job${trackedJobs.length !== 1 ? 's' : ''} tracked`
  })
}

function saveSettings() {
  const raw = $('settings-key').value.trim()
  const msg = $('settings-msg')

  console.log('[JobAgent popup] saveSettings called — raw value length:', raw.length, '— starts with bullet:', raw.startsWith('\u2022'), '— first char code:', raw.charCodeAt(0))

  // Only update key if user typed something new (not the masked placeholder)
  if (raw && !raw.startsWith('\u2022')) {
    const trimmed = raw.trim()
    console.log('[JobAgent popup] Saving API key — length:', trimmed.length, '— ends with:', trimmed.slice(-4))

    chrome.storage.sync.set({ apiKey: trimmed }, () => {
      if (chrome.runtime.lastError) {
        console.log('[JobAgent popup] chrome.storage.sync.set ERROR:', chrome.runtime.lastError.message)
        msg.className = 'err'
        msg.textContent = 'Save failed: ' + chrome.runtime.lastError.message
        msg.style.display = 'block'
        return
      }

      console.log('[JobAgent popup] Saved successfully, verifying...')
      chrome.storage.sync.get('apiKey', ({ apiKey: saved }) => {
        console.log('[JobAgent popup] Verification — retrieved length:', saved ? saved.length : 0, '— ends with:', saved ? saved.slice(-4) : '(empty)')

        apiKey = trimmed
        const hint = $('settings-key-hint')
        if (hint) hint.textContent = `Stored · ends …${trimmed.slice(-4)}`

        msg.className = 'success'
        msg.textContent = `✓ API key saved (…${trimmed.slice(-4)})`
        msg.style.display = 'block'
        setTimeout(() => { msg.style.display = 'none'; showScreen('main') }, 1500)
      })
    })
  } else {
    console.log('[JobAgent popup] No new key entered — skipping save, showing saved status')
    msg.className = 'success'
    msg.textContent = apiKey ? `✓ Key already saved (…${apiKey.slice(-4)})` : '✓ No key to save.'
    msg.style.display = 'block'
    setTimeout(() => { msg.style.display = 'none'; showScreen('main') }, 1200)
  }
}


// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // Load API key + language from storage
  chrome.storage.sync.get(['apiKey', 'outputLanguage'], async ({ apiKey: stored, outputLanguage: storedLang }) => {
    apiKey = stored || ''
    outputLanguage = storedLang || 'EN'
    console.log('API key loaded:', apiKey ? apiKey.slice(0, 8) + '…' : '(none)', '— language:', outputLanguage)
    renderLangToggle()

    if (!apiKey) {
      showScreen('setup')
      return
    }

    showScreen('main')
    await loadJobData()
    loadEasyApplyStatus()
  })

  // Setup screen
  $('btn-save-setup').addEventListener('click', () => {
    const key = $('setup-key').value.trim()
    if (!key) {
      $('setup-err').textContent = 'Please enter your API key.'
      $('setup-err').style.display = 'block'
      return
    }
    $('setup-err').style.display = 'none'
    const trimmedKey = key.trim()
    apiKey = trimmedKey
    chrome.storage.sync.set({ apiKey: trimmedKey }, async () => {
      console.log('[JobAgent popup] Setup key saved — length:', trimmedKey.length, '— full value:', trimmedKey)
      showScreen('main')
      await loadJobData()
    })
  })

  // Main screen buttons
  $('btn-prepare-apply').addEventListener('click', prepareAndApply)
  $('btn-analyse').addEventListener('click', analyseJob)
  $('btn-cover').addEventListener('click', generateCoverLetter)
  $('btn-log').addEventListener('click', () => logJob())

  // Nav buttons
  $('btn-settings').addEventListener('click', () => { loadSettings(); renderLangToggle(); showScreen('settings') })
  $('btn-tracker').addEventListener('click', () => { loadTracker(); showScreen('tracker') })
  $('btn-back-settings').addEventListener('click', () => showScreen('main'))
  $('btn-back-tracker').addEventListener('click', () => showScreen('main'))

  // Settings
  $('btn-save-settings').addEventListener('click', saveSettings)
  $('btn-clear-jobs').addEventListener('click', () => {
    if (!confirm('Clear all saved jobs?')) return
    chrome.storage.local.set({ trackedJobs: [] }, loadTracker)
    $('jobs-count').textContent = '0 jobs tracked'
  })

  // Allow Enter key on API key inputs
  $('setup-key').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-save-setup').click() })
  $('settings-key').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-save-settings').click() })
})

// Expose for inline onclick handlers in result HTML
window.generateCoverLetter = generateCoverLetter
window.logJob = logJob
