// JobAgent background service worker (MV3)
// All Anthropic API calls are made here, isolated from page scripts.

console.log('[JobAgent BG] background.js loaded')

// BUG 4 — keepalive alarm prevents service worker from going dormant
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('keepalive', { periodInMinutes: 0.33 }) // ~20 seconds
})
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepalive') console.log('[JobAgent BG] keepalive ping')
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[JobAgent BG] Message received:', message.type)
  if (message.type === 'CALL_ANTHROPIC') {
    const { apiKey, language } = message
    const langInstr = language === 'FR' ? '\n\nWrite your entire response in French. Use formal French appropriate for professional job applications in Belgium.'
                    : language === 'NL' ? '\n\nSchrijf je volledige antwoord in het Nederlands. Gebruik formeel Nederlands dat geschikt is voor professionele sollicitaties in België.'
                    : ''
    const prompt = message.prompt + langInstr
    console.log('[JobAgent BG] CALL_ANTHROPIC — key starts with:', apiKey ? apiKey.slice(0, 8) : '(empty)', '— ends with:', apiKey ? apiKey.slice(-4) : '(empty)')
    console.log('[JobAgent BG] Full key length:', apiKey ? apiKey.length : 0)

    ;(async () => {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        console.log('[JobAgent BG] Response status:', response.status)
        console.log('[JobAgent BG] Response headers — content-type:', response.headers.get('content-type'))

        const rawText = await response.text()
        console.log('[JobAgent BG] Raw response:', rawText)

        if (!response.ok) {
          sendResponse({ ok: false, error: `HTTP ${response.status}: ${rawText}` })
          return
        }

        const data = JSON.parse(rawText)
        sendResponse({ ok: true, text: data.content?.[0]?.text || '' })
      } catch (err) {
        console.log('[JobAgent BG] Fetch error:', err.message)
        sendResponse({ ok: false, error: err.message })
      }
    })()

    return true  // keep message channel open for async sendResponse
  }

  if (message.type === 'PREPARE_APPLY') {
    const { apiKey, job, language } = message
    console.log('[JobAgent BG] PREPARE_APPLY — job:', job?.title, '/', job?.company, '— language:', language || 'EN')

    ;(async () => {
      try {
        const langInstr = language === 'FR' ? '\n\nWrite your entire response in French. Use formal French appropriate for professional job applications in Belgium.'
                        : language === 'NL' ? '\n\nSchrijf je volledige antwoord in het Nederlands. Gebruik formeel Nederlands dat geschikt is voor professionele sollicitaties in België.'
                        : ''
        const prompt = `Write application materials for Michael Van Gyseghem applying to "${job.title}" at "${job.company}". Profile: Strategic Sales & BD Leader, 8+ years B2B experience in SaaS/Fintech/Real Estate, based in Brussels, trilingual EN/FR/NL.

Return ONLY valid JSON, no markdown:
{"coverLetter":"Professional 3-paragraph cover letter under 200 words tailored to this role","formAnswers":{"whyThisRole":"2 sentence answer tailored to the role and company","describeExperience":"2 sentence answer using Michael's real experience","salaryExpectation":"€80,000–€110,000 depending on full package","noticePeriod":"Available immediately","motivation":"1 sentence answer"}}` + langInstr

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        const rawText = await response.text()
        console.log('[JobAgent BG] PREPARE_APPLY — status:', response.status)
        if (!response.ok) { sendResponse({ ok: false, error: `HTTP ${response.status}: ${rawText}` }); return }

        const data = JSON.parse(rawText)
        const text = data.content?.[0]?.text || ''
        const start = text.indexOf('{'), end = text.lastIndexOf('}')
        if (start === -1 || end === -1) { sendResponse({ ok: false, error: 'No JSON in response' }); return }
        const parsed = JSON.parse(text.slice(start, end + 1))
        sendResponse({ ok: true, coverLetter: parsed.coverLetter || '', formAnswers: parsed.formAnswers || {} })
      } catch (err) {
        console.log('[JobAgent BG] PREPARE_APPLY error:', err.message)
        sendResponse({ ok: false, error: err.message })
      }
    })()

    return true
  }
})
