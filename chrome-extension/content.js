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

  // ── Contact email extraction ──────────────────────────────────────
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
  const blockedDomains = ['linkedin.com', 'sentry.io', 'example.com', 'facebook.com', 'twitter.com', 'instagram.com', 'google.com', 'microsoft.com', 'apple.com']
  const seenEmails = new Set()
  const contactEmails = []

  // Scan mailto: hrefs
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
    const addr = a.href.replace('mailto:', '').split('?')[0].trim().toLowerCase()
    if (addr && !seenEmails.has(addr) && !blockedDomains.some(d => addr.includes(d))) {
      seenEmails.add(addr); contactEmails.push(addr)
    }
  })

  // Scan all text content on page
  const pageText = document.body.innerText || ''
  const textMatches = pageText.match(emailRegex) || []
  for (const addr of textMatches) {
    const lower = addr.toLowerCase()
    if (!seenEmails.has(lower) && !blockedDomains.some(d => lower.includes(d))) {
      seenEmails.add(lower); contactEmails.push(lower)
      if (contactEmails.length >= 3) break
    }
  }

  console.log('[JobAgent] Contact emails found:', contactEmails)

  const result = {
    title,
    company,
    description: description.slice(0, 3000),
    url: cleanUrl(window.location.href),
    site,
    detected: !!(title || company) || description.length > 0,
    contactEmails,
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
  const EASY_APPLY_TEXTS = ['easy apply', 'candidature simplifi\u00e9e', 'eenvoudig solliciteren']

  // Broad scan: check every button and anchor on the page
  const allButtons = Array.from(document.querySelectorAll('button'))
  const allLinks   = Array.from(document.querySelectorAll('a'))
  console.log('[JobAgent] detectEasyApply — checking', allButtons.length, 'buttons and', allLinks.length, 'links')

  let buttonFound = false
  let buttonEl = null

  const isEasyApply = (el) => {
    const text  = (el.innerText  || el.textContent || '').toLowerCase()
    const label = (el.getAttribute('aria-label') || '').toLowerCase()
    return EASY_APPLY_TEXTS.some(t => text.includes(t) || label.includes(t))
  }

  for (const el of [...allButtons, ...allLinks]) {
    if (isEasyApply(el)) {
      buttonFound = true
      buttonEl = el
      console.log('[JobAgent] Easy Apply button found: ' + (el.innerText || el.textContent || '').trim())
      break
    }
  }

  const modalOpen = !!(
    document.querySelector('.jobs-easy-apply-modal') ||
    document.querySelector('.jobs-easy-apply-content') ||
    document.querySelector('[data-test-modal-id="easy-apply-modal"]')
  )

  console.log('[JobAgent] detectEasyApply — result: buttonFound=' + buttonFound + ' modalOpen=' + modalOpen)
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
        storeEasyApplyStatus()
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
    console.log('[JobAgent] FILL_FORM message received')
    const { coverLetter, formAnswers } = msg

    const fillField = (el, value) => {
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
      el.dispatchEvent(new Event('input',  { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }

    const fillFields = () => {
      // ── Discovery: log every visible input and textarea on the page ──
      const isVisible = el => el.offsetParent !== null && el.style.display !== 'none' && el.style.visibility !== 'hidden'

      const allInputs    = Array.from(document.querySelectorAll('input')).filter(isVisible)
      const allTextareas = Array.from(document.querySelectorAll('textarea')).filter(isVisible)

      console.log('[JobAgent] FILL_FORM — visible inputs found:', allInputs.length)
      allInputs.forEach((inp, i) => {
        console.log(`[JobAgent] FILL_FORM — input[${i}] type=${inp.type} id=${inp.id} name=${inp.name} placeholder="${inp.placeholder}" aria-label="${inp.getAttribute('aria-label') || ''}"`)
      })
      console.log('[JobAgent] FILL_FORM — visible textareas found:', allTextareas.length)
      allTextareas.forEach((ta, i) => {
        console.log(`[JobAgent] FILL_FORM — textarea[${i}] id=${ta.id} name=${ta.name} placeholder="${ta.placeholder}" aria-label="${ta.getAttribute('aria-label') || ''}"`)
      })

      let filled = 0

      // ── Email ────────────────────────────────────────────────────────
      allInputs.filter(inp => inp.type === 'email' || (inp.name || '').toLowerCase().includes('email') || (inp.id || '').toLowerCase().includes('email')).forEach(inp => {
        fillField(inp, 'michael.vangyseghem@gmail.com')
        console.log('[JobAgent] FILL_FORM — filled EMAIL:', inp.id || inp.name || inp.type)
        filled++
      })

      // ── Phone / Tel ──────────────────────────────────────────────────
      allInputs.filter(inp => {
        const ctx = (inp.type + ' ' + inp.name + ' ' + inp.id + ' ' + (inp.getAttribute('aria-label') || '') + ' ' + inp.placeholder).toLowerCase()
        return inp.type === 'tel' || ctx.includes('phone') || ctx.includes('mobile') || ctx.includes('tel')
      }).forEach(inp => {
        const ctx = (inp.name + ' ' + inp.id + ' ' + (inp.getAttribute('aria-label') || '') + ' ' + inp.placeholder).toLowerCase()
        const val = (ctx.includes('country') || ctx.includes('code') || ctx.includes('prefix')) ? '+32' : '456032636'
        fillField(inp, val)
        console.log('[JobAgent] FILL_FORM — filled PHONE (' + val + '):', inp.id || inp.name)
        filled++
      })

      // ── Text / Number inputs: label-based routing ────────────────────
      allInputs.filter(inp => ['text', 'number', ''].includes(inp.type)).forEach(inp => {
        const labelEl = inp.id ? document.querySelector(`label[for="${inp.id}"]`) : null
        const ctx = ((labelEl?.textContent || '') + ' ' + (inp.getAttribute('aria-label') || '') + ' ' + inp.placeholder + ' ' + inp.name + ' ' + inp.id).toLowerCase()
        if (ctx.includes('salary') || ctx.includes('salaire') || ctx.includes('loon') || ctx.includes('wage') || ctx.includes('compensation')) {
          fillField(inp, formAnswers?.salaryExpectation || '€80,000–€110,000')
          console.log('[JobAgent] FILL_FORM — filled SALARY input:', inp.id || inp.name)
          filled++
        } else if (ctx.includes('notice') || ctx.includes('availability') || ctx.includes('beschikbaar') || ctx.includes('disponib') || ctx.includes('start date')) {
          fillField(inp, formAnswers?.noticePeriod || 'Available immediately')
          console.log('[JobAgent] FILL_FORM — filled NOTICE input:', inp.id || inp.name)
          filled++
        }
      })

      // ── Textareas ────────────────────────────────────────────────────
      allTextareas.forEach(ta => {
        const labelEl = ta.id ? document.querySelector(`label[for="${ta.id}"]`) : null
        const ctx = ((labelEl?.textContent || '') + ' ' + (ta.getAttribute('aria-label') || '') + ' ' + ta.placeholder + ' ' + ta.name + ' ' + ta.id).toLowerCase()
        if (ctx.includes('why') || ctx.includes('pourquoi') || ctx.includes('waarom') || ctx.includes('motivation') || ctx.includes('motivatie') || ctx.includes('cover') || ctx.includes('letter')) {
          fillField(ta, formAnswers?.whyThisRole || coverLetter)
          console.log('[JobAgent] FILL_FORM — filled WHY/MOTIVATION textarea:', ta.id || ta.name)
          filled++
        } else if (ctx.includes('experience') || ctx.includes('describe') || ctx.includes('ervaring') || ctx.includes('background')) {
          fillField(ta, formAnswers?.describeExperience || coverLetter)
          console.log('[JobAgent] FILL_FORM — filled EXPERIENCE textarea:', ta.id || ta.name)
          filled++
        } else if (ctx.includes('salary') || ctx.includes('salaire') || ctx.includes('loon') || ctx.includes('wage')) {
          fillField(ta, formAnswers?.salaryExpectation || '€80,000–€110,000')
          console.log('[JobAgent] FILL_FORM — filled SALARY textarea:', ta.id || ta.name)
          filled++
        } else if (ctx.includes('notice') || ctx.includes('availability') || ctx.includes('beschikbaar') || ctx.includes('disponib')) {
          fillField(ta, formAnswers?.noticePeriod || 'Available immediately')
          console.log('[JobAgent] FILL_FORM — filled NOTICE textarea:', ta.id || ta.name)
          filled++
        } else if (!ta.value) {
          fillField(ta, coverLetter)
          console.log('[JobAgent] FILL_FORM — filled textarea (default cover letter):', ta.id || ta.name)
          filled++
        }
      })

      console.log('[JobAgent] FILL_FORM — done, fields filled:', filled)
      sendResponse({ ok: true, filled })
    }

    // Click button if modal not yet open, then wait 2000ms for animation
    const { buttonEl } = detectEasyApply()
    const modalAlreadyOpen = !!(document.querySelector('[role="dialog"]') || document.querySelector('.artdeco-modal') || document.querySelector('.jobs-easy-apply-modal'))
    if (!modalAlreadyOpen && buttonEl) {
      console.log('[JobAgent] FILL_FORM — clicking Easy Apply button, waiting 2000ms')
      buttonEl.click()
    } else {
      console.log('[JobAgent] FILL_FORM — modal already open (or no button), waiting 2000ms')
    }
    setTimeout(fillFields, 3000)
  }

  return true
})


// ── Init ──────────────────────────────────────────────────────────────────────
if (host.includes('linkedin.com')) {
  // LinkedIn: defer until React renders the job card
  waitForLinkedIn()
  // Run immediately — button may already be in DOM on fast page loads
  storeEasyApplyStatus()
  // Run again after 2s — LinkedIn sometimes renders the Apply button after the job card
  setTimeout(storeEasyApplyStatus, 2000)
  setTimeout(storeEasyApplyStatus, 5000)
} else {
  // Other sites: extract immediately and cache
  const job = extract()
  if (job.detected) chrome.storage.local.set({ jobagent_current_job: job })
}
