import { MESSAGE_TYPES, STORAGE_KEYS } from "../shared/messages.js"

const API_BASE = "http://localhost:3001"
const HEARTBEAT_ALARM = "exam-guard-heartbeat"

const sessionState = {
  active: false,
  sessionId: null,
  token: null,
  lastReason: "idle",
  protectedTabId: null,
}

const getActiveTabId = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs[0]?.id ?? null
}

const focusProtectedTab = async () => {
  if (!sessionState.active || !sessionState.protectedTabId) {
    return
  }

  try {
    const tab = await chrome.tabs.get(sessionState.protectedTabId)
    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true })
    }
    await chrome.tabs.update(sessionState.protectedTabId, { active: true })
  } catch {
    // protected tab may be closed
  }
}

const enforceProtectedTab = async () => {
  if (!sessionState.active || !sessionState.protectedTabId) {
    return
  }

  try {
    const allTabs = await chrome.tabs.query({})
    const foreignActiveTabs = allTabs.filter(
      (tab) => tab.active && tab.id && tab.id !== sessionState.protectedTabId,
    )

    if (!foreignActiveTabs.length) {
      return
    }

    await focusProtectedTab()
  } catch {
    // ignore temporary tab query failures
  }
}

const saveState = async () => {
  await chrome.storage.local.set({
    [STORAGE_KEYS.SESSION]: sessionState,
    [STORAGE_KEYS.LAST_STATUS]: {
      active: sessionState.active,
      sessionId: sessionState.sessionId,
      reason: sessionState.lastReason,
      ts: Date.now(),
    },
  })
}

const notifyTabs = async (message) => {
  const tabs = await chrome.tabs.query({ url: ["http://localhost:3000/*"] })
  await Promise.all(
    tabs.map(async (tab) => {
      if (!tab.id) return
      try {
        await chrome.tabs.sendMessage(tab.id, message)
      } catch {
        // tab may not have content script ready
      }
    }),
  )
}

const verifySession = async (token) => {
  const response = await fetch(`${API_BASE}/api/exam/session/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) {
    throw new Error(`verify_failed_${response.status}`)
  }
  return response.json()
}

const sendHeartbeat = async () => {
  if (!sessionState.active || !sessionState.sessionId || !sessionState.token) return
  try {
    const response = await fetch(`${API_BASE}/api/exam/session/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionState.sessionId,
        token: sessionState.token,
        ts: Date.now(),
      }),
    })
    if (!response.ok) throw new Error(`heartbeat_failed_${response.status}`)
    const payload = await response.json()
    if (!payload.valid) {
      await disableSession("session_invalid")
    }
  } catch {
    // soft behavior: keep active but mark reason for website soft-lock logic
    sessionState.lastReason = "heartbeat_unreachable"
    await saveState()
  }
}

const enableSession = async (token) => {
  const payload = await verifySession(token)
  if (!payload.valid) {
    await disableSession("invalid_token")
    return { ok: false, reason: "invalid_token" }
  }

  sessionState.active = true
  sessionState.token = token
  sessionState.sessionId = payload.sessionId
  sessionState.lastReason = "active"
  await saveState()
  await focusProtectedTab()
  await chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: 0.5 })
  await notifyTabs({ type: MESSAGE_TYPES.WORKER_APPLY_GUARD })
  return { ok: true, active: true }
}

const disableSession = async (reason = "disabled") => {
  sessionState.active = false
  sessionState.lastReason = reason
  sessionState.token = null
  sessionState.sessionId = null
  sessionState.protectedTabId = null
  await saveState()
  await chrome.alarms.clear(HEARTBEAT_ALARM)
  await notifyTabs({ type: MESSAGE_TYPES.WORKER_DISABLE_GUARD, payload: { reason } })
}

chrome.tabs.onCreated.addListener(async (tab) => {
  if (!sessionState.active || !sessionState.protectedTabId || !tab.id) {
    return
  }

  if (tab.id === sessionState.protectedTabId) {
    return
  }

  try {
    await chrome.tabs.remove(tab.id)
    await focusProtectedTab()
  } catch {
    // ignore non-closable tab edge cases
  }
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!sessionState.active || !sessionState.protectedTabId) {
    return
  }

  if (tabId === sessionState.protectedTabId) {
    return
  }

  try {
    await chrome.tabs.update(tabId, { active: false })
  } catch {
    // ignore; some tabs cannot be deactivated explicitly
  }

  await focusProtectedTab()
})

chrome.windows.onFocusChanged.addListener(async () => {
  await enforceProtectedTab()
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === HEARTBEAT_ALARM) {
    await sendHeartbeat()
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type) return

  if (message.type === MESSAGE_TYPES.WEBSITE_START_EXAM) {
    ;(async () => {
      const senderTabId = sender.tab?.id ?? null
      sessionState.protectedTabId = senderTabId ?? await getActiveTabId()
      const result = await enableSession(message.payload?.token)
      sendResponse(result)
    })()
      .catch(async () => {
        await disableSession("start_failed")
        sendResponse({ ok: false, reason: "start_failed" })
      })
    return true
  }

  if (message.type === MESSAGE_TYPES.WORKER_STATUS) {
    ;(async () => {
      if (!sessionState.protectedTabId) {
        sessionState.protectedTabId = await getActiveTabId()
        await saveState()
      }
      return {
        active: sessionState.active,
        reason: sessionState.lastReason,
        protectedTabId: sessionState.protectedTabId,
      }
    })()
      .then(sendResponse)
      .catch(() =>
        sendResponse({ active: false, reason: "status_failed", protectedTabId: null }),
      )
    return true
  }

  if (message.type === MESSAGE_TYPES.WEBSITE_END_EXAM) {
    ;(async () => {
      try {
        if (sessionState.sessionId && sessionState.token) {
          await fetch(`${API_BASE}/api/exam/session/end`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionState.sessionId,
              token: sessionState.token,
              reason: message.payload?.reason ?? "website_end",
            }),
          })
        }
      } finally {
        await disableSession(message.payload?.reason ?? "ended")
        sendResponse({ ok: true })
      }
    })()
    return true
  }

  if (message.type === MESSAGE_TYPES.WEBSITE_PING) {
    sendResponse({ active: sessionState.active, reason: sessionState.lastReason })
    return
  }

  if (message.type === MESSAGE_TYPES.CONTENT_EVENT) {
    ;(async () => {
      if (!sessionState.active || !sessionState.sessionId || !sessionState.token) return
      try {
        await fetch(`${API_BASE}/api/exam/session/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionState.sessionId,
            token: sessionState.token,
            event: message.payload,
          }),
        })
      } catch {
        // best effort
      }
    })()
    sendResponse({ ok: true })
    return true
  }

  if (message.type === MESSAGE_TYPES.POPUP_QUIT) {
    ;(async () => {
      try {
        if (sessionState.sessionId && sessionState.token) {
          await fetch(`${API_BASE}/api/exam/session/end`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionState.sessionId,
              token: sessionState.token,
              reason: "emergency_quit",
            }),
          })
        }
      } finally {
        await disableSession("emergency_quit")
        sendResponse({ ok: true })
      }
    })()
    return true
  }
})
