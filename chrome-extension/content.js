// JobAgent content script — detects job data on supported job boards

const host = window.location.hostname

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
    url: window.location.href,
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
    if (job.title && job.company) {
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
      console.log('[JobAgent] LinkedIn — timeout, storing best result available')
      chrome.storage.local.set({ jobagent_current_job: job })
    }
  }

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => attemptExtraction('mutation debounce'), DEBOUNCE_MS)
  })
  observer.observe(document.body, { childList: true, subtree: true })

  // Attempt immediately without waiting for a mutation (catches already-rendered pages)
  attemptExtraction('immediate on load')
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
  return true
})


// ── Init ──────────────────────────────────────────────────────────────────────
if (host.includes('linkedin.com')) {
  // LinkedIn: defer until React renders the job card
  waitForLinkedIn()
} else {
  // Other sites: extract immediately and cache
  const job = extract()
  if (job.detected) chrome.storage.local.set({ jobagent_current_job: job })
}
