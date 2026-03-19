// JobAgent content script — detects job data on supported job boards

const host = window.location.hostname

// Strip all LinkedIn tracking query params — keep only currentJobId if present
function cleanUrl(href) {
  try {
    const u = new URL(href)
    if (u.hostname.includes('linkedin.com')) {
      const jobId = u.searchParams.get('currentJobId')
      const clean = u.origin + u.pathname
      return jobId ? `${clean}?currentJobId=${jobId}` : clean
    }
  } catch {}
  return href
}

function extract() {
  const try_ = (...sels) => {
    for (const sel of sels) {
      const el = document.querySelector(sel)
      if (el?.innerText?.trim()) return el.innerText.trim()
    }
    return ''
  }

  let title = '', company = '', description = '', site = ''

  // ── LinkedIn ──────────────────────────────────────────────────────
  if (host.includes('linkedin.com')) {
    site = 'LinkedIn'

    // ── Title ──
    const titleSelectors = [
      '.job-details-jobs-unified-top-card__job-title h1',
      '.job-details-jobs-unified-top-card__job-title--grouped h1',
      'h1.t-24',
      'h1.t-20',
      '.top-card-layout__title',
      'h1[class*="job-title"]',
    ]
    let titleMatchedSel = null
    for (const sel of titleSelectors) {
      const el = document.querySelector(sel)
      if (el?.innerText?.trim()) {
        title = el.innerText.trim()
        titleMatchedSel = sel
        break
      }
    }
    // Broad fallback: first h1 on page
    if (!title) {
      const h1 = document.querySelector('h1')
      if (h1?.innerText?.trim()) {
        title = h1.innerText.trim()
        titleMatchedSel = 'h1 (broad fallback)'
      }
    }
    console.log('[JobAgent] LinkedIn title — selector:', titleMatchedSel || '(none)', '— value:', title || '(empty)')

    // ── Company ──
    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name a',
      '.topcard__org-name-link',
      '.top-card-layout__second-subline .topcard__flavor--black-link',
      '[class*="company-name"] a',
    ]
    let companyMatchedSel = null
    for (const sel of companySelectors) {
      const el = document.querySelector(sel)
      if (el?.innerText?.trim()) {
        company = el.innerText.trim()
        companyMatchedSel = sel
        break
      }
    }
    // Broad fallback: scan all ember-view links for short text with no @ symbol
    if (!company) {
      const links = document.querySelectorAll('a.ember-view')
      for (const a of links) {
        const t = a.innerText?.trim()
        if (t && t.length > 1 && t.length < 60 && !t.includes('@') && !t.includes('\n')) {
          company = t
          companyMatchedSel = 'a.ember-view (broad fallback)'
          break
        }
      }
    }
    console.log('[JobAgent] LinkedIn company — selector:', companyMatchedSel || '(none)', '— value:', company || '(empty)')

    // ── Description ──
    const descSelectors = [
      '#job-details span',
      '#job-details',
      '.jobs-description__content',
      '.jobs-description',
      '.jobs-box__html-content',
      '.description__text',
      '[class*="job-description"]',
    ]
    let descMatchedSel = null
    for (const sel of descSelectors) {
      const el = document.querySelector(sel)
      if (el?.innerText?.trim()) {
        description = el.innerText.trim()
        descMatchedSel = sel
        break
      }
    }
    // Broad fallback: collect all <p> text on page
    if (!description) {
      const paras = document.querySelectorAll('p')
      const text = Array.from(paras).map(p => p.innerText?.trim()).filter(Boolean).join('\n')
      if (text) {
        description = text
        descMatchedSel = 'p (broad fallback)'
      }
    }
    console.log('[JobAgent] LinkedIn description — selector:', descMatchedSel || '(none)', '— chars:', description.length)

    // ── document.title fallback for title + company ──
    // LinkedIn format: "Project Manager | Randstad Digital Belgium | LinkedIn"
    if (!title || !company) {
      console.log('[JobAgent] LinkedIn document.title:', document.title)
      const titleParts = document.title.split(' | ')
      if (titleParts.length >= 2) {
        if (!title) title = titleParts[0].trim()
        if (!company) company = titleParts[1].trim()
        console.log('[JobAgent] LinkedIn title/company from document.title — title:', title, '— company:', company)
      }
    }
  }

  // ── Indeed ────────────────────────────────────────────────────────
  else if (host.includes('indeed.com')) {
    site = 'Indeed'
    title = try_(
      'h1.jobsTitle',
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1[class*="jobTitle"]',
      '.css-1b4cr5z'
    )
    company = try_(
      '[data-testid="inlineHeader-companyName"] a',
      '[data-company-name]',
      '.css-1h0oufa',
      '[class*="InlineCompanyRating"] a'
    )
    description = try_(
      '#jobDescriptionText',
      '[data-testid="jobDescriptionText"]',
      '.jobsearch-jobDescriptionText'
    )
  }

  // ── Glassdoor ─────────────────────────────────────────────────────
  else if (host.includes('glassdoor.com') || host.includes('glassdoor.co.uk')) {
    site = 'Glassdoor'
    title = try_(
      '[data-test="job-title"]',
      'h1[class*="title"]',
      '.css-17x2pwl h1',
      '[class*="JobTitle"]'
    )
    company = try_(
      '[data-test="employer-name"]',
      '[class*="EmployerProfile"] span',
      '.css-16nw49e',
      '[class*="employer"] a'
    )
    description = try_(
      '.JobDetails_jobDescriptionWrapper__tgcNn',
      '.jobDescriptionContent',
      '[data-test="description"]',
      '[class*="description"]'
    )
  }

  // ── Welcome to the Jungle ─────────────────────────────────────────
  else if (host.includes('welcometothejungle.com')) {
    site = 'Welcome to the Jungle'
    title = try_(
      'h1[data-testid="job-title"]',
      'h1[class*="sc-"]',
      '[class*="job-title"] h1',
      'h1'
    )
    company = try_(
      '[data-testid="company-name"]',
      '[class*="organization"] h2',
      'a[class*="company"]',
      '[class*="company-name"]'
    )
    description = try_(
      '[data-testid="job-section-description"]',
      '[class*="job-description"]',
      'section[id*="description"]',
      '[class*="description-content"]'
    )
  }

  // ── StepStone ─────────────────────────────────────────────────────
  else if (host.includes('stepstone')) {
    site = 'StepStone'
    title = try_(
      '[data-testid="job-title"]',
      '.at-header-title',
      'h1[itemprop="title"]',
      'h1[class*="title"]'
    )
    company = try_(
      '[data-testid="company-name"]',
      '.at-listing__title',
      '[itemprop="name"]',
      '[class*="company"] a'
    )
    description = try_(
      '[data-testid="job-description"]',
      '.at-job-ad-details',
      '[itemprop="description"]',
      '[class*="description-content"]'
    )
  }

  const result = {
    title,
    company,
    description: description.slice(0, 3000),
    url: cleanUrl(window.location.href),
    site,
    detected: !!(title || company) || description.length > 0,
  }

  console.log('[JobAgent] extract() result:', {
    site: result.site,
    title: result.title || '(none)',
    company: result.company || '(none)',
    descriptionChars: result.description.length,
    detected: result.detected,
    url: result.url,
  })

  return result
}


// ── Easy Apply detection ──────────────────────────────────────────────────────
function detectEasyApply() {
  const buttonSelectors = [
    '.jobs-apply-button--top-card button',
    'button.jobs-apply-button',
    'button[aria-label="Easy Apply"]',
    'button[aria-label*="Candidature simplifi\u00e9e"]',
  ]
  let buttonFound = false
  let buttonEl = null
  for (const sel of buttonSelectors) {
    const el = document.querySelector(sel)
    if (el) { buttonFound = true; buttonEl = el; break }
  }
  const modalOpen = !!(
    document.querySelector('.jobs-easy-apply-modal') ||
    document.querySelector('.jobs-easy-apply-content') ||
    document.querySelector('[data-test-modal-id="easy-apply-modal"]')
  )
  return { detected: buttonFound || modalOpen, buttonFound, modalOpen, buttonEl }
}

function storeEasyApplyStatus() {
  const { detected, buttonFound, modalOpen } = detectEasyApply()
  chrome.storage.local.set({ jobagent_easy_apply: { detected, buttonFound, modalOpen } })
}


// ── Guard: reject search/intermediate pages ───────────────────────────────────
function isValidJob(job) {
  if (!job.title || !job.company) return false
  if (job.title === 'Search all Jobs') return false
  if (job.company === 'LinkedIn') return false
  return true
}


// ── LinkedIn deferred extraction — debounced MutationObserver ─────────────────
function waitForLinkedIn() {
  console.log('[JobAgent] LinkedIn — setting up debounced MutationObserver')

  let done = false
  let debounceTimer = null
  const DEBOUNCE_MS = 800
  const TIMEOUT_MS  = 15000
  const startTime   = Date.now()

  function attemptExtraction(reason) {
    if (done) return
    const job = extract()
    if (isValidJob(job)) {
      done = true
      observer.disconnect()
      clearTimeout(debounceTimer)
      console.log('[JobAgent] LinkedIn — extraction complete, reason:', reason)
      chrome.storage.local.set({ jobagent_current_job: job })
      console.log('[JobAgent] LinkedIn — stored to jobagent_current_job, detected:', job.detected)
    } else if (Date.now() - startTime >= TIMEOUT_MS) {
      done = true
      observer.disconnect()
      clearTimeout(debounceTimer)
      if (isValidJob(job)) {
        chrome.storage.local.set({ jobagent_current_job: job })
      } else {
        console.log('[JobAgent] LinkedIn — timeout but result invalid (search page?), not storing:', job.title, '/', job.company)
      }
    }
  }

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      attemptExtraction('mutation debounce')
      storeEasyApplyStatus()
    }, DEBOUNCE_MS)
  })
  observer.observe(document.body, { childList: true, subtree: true })

  // Attempt immediately without waiting for a mutation (catches already-rendered pages)
  attemptExtraction('immediate on load')
}


// ── SPA navigation detection (LinkedIn React router) ─────────────────────────
if (host.includes('linkedin.com')) {

  // Override history methods to fire a custom locationchange event
  const _pushState    = history.pushState.bind(history)
  const _replaceState = history.replaceState.bind(history)

  history.pushState = function (...args) {
    _pushState(...args)
    window.dispatchEvent(new Event('locationchange'))
  }
  history.replaceState = function (...args) {
    _replaceState(...args)
    window.dispatchEvent(new Event('locationchange'))
  }

  let lastUrl = cleanUrl(window.location.href)
  let reextractTimer = null

  function onNavigation() {
    const newUrl = window.location.href
    if (newUrl === lastUrl) return
    console.log('[JobAgent] LinkedIn navigation detected — old:', lastUrl, '— new:', newUrl)
    lastUrl = newUrl

    // Clear stale data immediately so popup shows loading state
    chrome.storage.local.remove('jobagent_current_job')
    clearTimeout(reextractTimer)

    // Wait 1500ms for React to start rendering, then retry up to 3 times with 1s gap
    reextractTimer = setTimeout(() => {
      let attempt = 0
      const maxAttempts = 3

      function tryExtract() {
        attempt++
        console.log('[JobAgent] LinkedIn re-extraction attempt', attempt, 'of', maxAttempts)
        const job = extract()
        if (isValidJob(job)) {
          console.log('[JobAgent] LinkedIn re-extraction succeeded on attempt', attempt)
          chrome.storage.local.set({ jobagent_current_job: job })
        } else if (attempt < maxAttempts) {
          console.log('[JobAgent] LinkedIn re-extraction attempt', attempt, '— invalid result (', job.title, '/', job.company, '), retrying…')
          setTimeout(tryExtract, 1000)
        } else {
          console.log('[JobAgent] LinkedIn re-extraction exhausted — final result invalid, not storing:', job.title, '/', job.company)
        }
      }

      tryExtract()
    }, 1500)
  }

  // Listen for our custom event (pushState / replaceState)
  window.addEventListener('locationchange', onNavigation)
  // Listen for back/forward browser navigation
  window.addEventListener('popstate', onNavigation)

  // Poll href every 1000ms as final fallback (catches navigations that bypass history API)
  setInterval(() => {
    if (window.location.href !== lastUrl) onNavigation()
  }, 1000)
}


// ── Message listener — serves stored result for reliability ───────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_JOB_DATA') {
    chrome.storage.local.get('jobagent_current_job', ({ jobagent_current_job }) => {
      if (jobagent_current_job?.detected) {
        console.log('[JobAgent] GET_JOB_DATA — returning stored result')
        sendResponse(jobagent_current_job)
      } else {
        console.log('[JobAgent] GET_JOB_DATA — no stored result, running extract() now')
        sendResponse(extract())
      }
    })
  }

  if (msg.type === 'FILL_FORM') {
    const { coverLetter, formAnswers } = msg

    const fillField = (el, value) => {
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
      el.dispatchEvent(new Event('input',  { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }

    const fillModal = () => {
      const modal = document.querySelector('.jobs-easy-apply-modal, .jobs-easy-apply-content, [data-test-modal-id="easy-apply-modal"]')
      if (!modal) {
        console.log('[JobAgent] FILL_FORM — modal not found after wait')
        sendResponse({ ok: false, error: 'Easy Apply modal not found' })
        return
      }
      console.log('[JobAgent] FILL_FORM — modal found, scanning fields')

      modal.querySelectorAll('textarea').forEach(ta => {
        const ctx = (ta.closest('label, [class*="form-item"], [class*="field"], [class*="jobs-easy-apply"]')?.textContent || '').toLowerCase()
        console.log('[JobAgent] FILL_FORM — textarea context:', ctx.slice(0, 80))
        if (ctx.includes('cover') || ctx.includes('letter') || ctx.includes('motivation') || ctx.includes('motivatie') || ctx.includes('why') || ctx.includes('pourquoi')) {
          fillField(ta, coverLetter); console.log('[JobAgent] FILL_FORM — filled cover letter textarea')
        } else if (ctx.includes('experience') || ctx.includes('describe') || ctx.includes('ervar')) {
          fillField(ta, formAnswers.describeExperience || ''); console.log('[JobAgent] FILL_FORM — filled experience textarea')
        } else if (ctx.includes('salary') || ctx.includes('salaire') || ctx.includes('loon') || ctx.includes('wage')) {
          fillField(ta, formAnswers.salaryExpectation || ''); console.log('[JobAgent] FILL_FORM — filled salary textarea')
        } else if (!ta.value) {
          fillField(ta, coverLetter); console.log('[JobAgent] FILL_FORM — filled textarea (default) with cover letter')
        }
      })

      modal.querySelectorAll('input[type="text"], input[type="number"], input:not([type])').forEach(inp => {
        const ctx = ((inp.closest('label, [class*="form-item"], [class*="field"]')?.textContent || '') + ' ' + (inp.placeholder || '')).toLowerCase()
        console.log('[JobAgent] FILL_FORM — input context:', ctx.slice(0, 80))
        if (ctx.includes('salary') || ctx.includes('salaire') || ctx.includes('loon') || ctx.includes('wage')) {
          fillField(inp, formAnswers.salaryExpectation || ''); console.log('[JobAgent] FILL_FORM — filled salary input')
        } else if (ctx.includes('notice') || ctx.includes('availability') || ctx.includes('beschikbaar') || ctx.includes('disponib')) {
          fillField(inp, formAnswers.noticePeriod || 'Available immediately'); console.log('[JobAgent] FILL_FORM — filled notice period input')
        }
      })

      sendResponse({ ok: true })
    }

    const { modalOpen, buttonEl } = detectEasyApply()
    if (!modalOpen && buttonEl) {
      console.log('[JobAgent] FILL_FORM — clicking Easy Apply button')
      buttonEl.click()
      setTimeout(fillModal, 1500)
    } else if (modalOpen) {
      fillModal()
    } else {
      sendResponse({ ok: false, error: 'Easy Apply button not found' })
    }
  }

  return true
})


// ── Init ──────────────────────────────────────────────────────────────────────
if (host.includes('linkedin.com')) {
  // LinkedIn: defer until React renders the job card
  waitForLinkedIn()
  storeEasyApplyStatus()
} else {
  // Other sites: extract immediately and cache
  const job = extract()
  if (job.detected) chrome.storage.local.set({ jobagent_current_job: job })
}
