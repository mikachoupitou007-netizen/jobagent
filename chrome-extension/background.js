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
    const { apiKey, prompt } = message
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
            model: 'claude-sonnet-4-20250514',
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
})
