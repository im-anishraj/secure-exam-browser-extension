const MESSAGE_TYPES = {
  WEBSITE_START_EXAM: "website:startExam",
  WEBSITE_END_EXAM: "website:endExam",
  WEBSITE_PING: "website:ping",
  WORKER_APPLY_GUARD: "worker:applyGuard",
  WORKER_DISABLE_GUARD: "worker:disableGuard",
  WORKER_STATUS: "worker:status",
  CONTENT_EVENT: "content:event",
}

const OVERLAY_ID = "exam-guard-active-overlay"
const STYLE_ID = "exam-guard-style"

const showOverlay = (text = "Exam Mode is Active") => {
  let node = document.getElementById(OVERLAY_ID)
  if (node) {
    node.textContent = text
    return
  }

  node = document.createElement("div")
  node.id = OVERLAY_ID
  node.textContent = text
  node.style.position = "fixed"
  node.style.top = "12px"
  node.style.right = "12px"
  node.style.padding = "8px 10px"
  node.style.borderRadius = "8px"
  node.style.background = "rgba(20,20,20,0.85)"
  node.style.color = "#fff"
  node.style.fontSize = "12px"
  node.style.fontWeight = "600"
  node.style.zIndex = "2147483647"
  node.style.pointerEvents = "none"
  document.documentElement.appendChild(node)
}

const hideOverlay = () => {
  const node = document.getElementById(OVERLAY_ID)
  if (node) {
    node.remove()
  }
}

let restrictionActive = false
const restrictionListeners = []

const preventDefault = (event) => {
  event.preventDefault()
  event.stopPropagation()
}

const onKeyDownRestriction = (event) => {
  const key = event.key.toLowerCase()
  const ctrlOrMeta = event.ctrlKey || event.metaKey
  if (ctrlOrMeta && ["c", "x", "v", "a", "u", "s", "p"].includes(key)) {
    preventDefault(event)
  }
  if (event.key === "F12") {
    preventDefault(event)
  }
}

const onMouseDownRestriction = (event) => {
  if (event.button === 2) {
    preventDefault(event)
  }

  if (event.button === 1) {
    preventDefault(event)
  }
}

const onClickRestriction = (event) => {
  if (event.ctrlKey || event.metaKey) {
    preventDefault(event)
  }
}

const registerRestriction = (target, type, handler, options = true) => {
  target.addEventListener(type, handler, options)
  restrictionListeners.push(() => target.removeEventListener(type, handler, options))
}

const applyRestrictions = () => {
  if (restrictionActive) {
    return
  }

  restrictionActive = true

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        user-select: none !important;
      }
    `
    document.documentElement.appendChild(style)
  }

  registerRestriction(window, "contextmenu", preventDefault)
  registerRestriction(document, "contextmenu", preventDefault)
  if (document.body) {
    registerRestriction(document.body, "contextmenu", preventDefault)
  }
  registerRestriction(window, "copy", preventDefault)
  registerRestriction(document, "copy", preventDefault)
  registerRestriction(window, "cut", preventDefault)
  registerRestriction(document, "cut", preventDefault)
  registerRestriction(window, "paste", preventDefault)
  registerRestriction(document, "paste", preventDefault)
  registerRestriction(window, "selectstart", preventDefault)
  registerRestriction(document, "selectstart", preventDefault)
  registerRestriction(window, "dragstart", preventDefault)
  registerRestriction(document, "dragstart", preventDefault)
  registerRestriction(window, "keydown", onKeyDownRestriction)
  registerRestriction(document, "keydown", onKeyDownRestriction)
  registerRestriction(window, "mousedown", onMouseDownRestriction)
  registerRestriction(document, "mousedown", onMouseDownRestriction)
  registerRestriction(window, "click", onClickRestriction)
  registerRestriction(document, "click", onClickRestriction)
}

const clearRestrictions = () => {
  restrictionActive = false
  while (restrictionListeners.length) {
    const remove = restrictionListeners.pop()
    remove?.()
  }
  const style = document.getElementById(STYLE_ID)
  if (style) {
    style.remove()
  }
}

let guardEnabled = false
let originalWindowOpen = null
let guardObserver = null

const emitEvent = (eventType, details = {}) => {
  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.CONTENT_EVENT,
    payload: {
      eventType,
      details,
      href: location.href,
      ts: Date.now(),
    },
  })
}

const postWebsiteStatus = (payload) => {
  window.postMessage(
    {
      source: "exam-extension",
      type: "EXAM_EXTENSION_STATUS",
      payload,
    },
    window.location.origin,
  )
}

const applyGuard = () => {
  if (guardEnabled) return
  guardEnabled = true
  applyRestrictions()

  if (!originalWindowOpen) {
    originalWindowOpen = window.open
  }
  window.open = () => null

  const sanitizeBlankTargets = () => {
    const links = document.querySelectorAll("a[target='_blank']")
    links.forEach((link) => link.removeAttribute("target"))
  }

  sanitizeBlankTargets()
  guardObserver = new MutationObserver(() => sanitizeBlankTargets())
  guardObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["target"],
  })

  showOverlay("Exam Mode is Active")
  postWebsiteStatus({ active: true })
}

const disableGuard = (reason = "inactive") => {
  if (!guardEnabled) return
  guardEnabled = false
  clearRestrictions()
  if (originalWindowOpen) {
    window.open = originalWindowOpen
  }
  if (guardObserver) {
    guardObserver.disconnect()
    guardObserver = null
  }
  hideOverlay()
  if (reason === "ended" || reason === "exam_completed") {
    showOverlay("Exam completed. You can now safely disable or uninstall this extension.")
    setTimeout(() => hideOverlay(), 7000)
  }
  postWebsiteStatus({ active: false, reason })
}

document.addEventListener("visibilitychange", () => {
  if (guardEnabled && document.visibilityState !== "visible") {
    emitEvent("visibility_hidden", { visibility: document.visibilityState })
  }
})

window.addEventListener("blur", () => {
  if (guardEnabled) emitEvent("window_blur")
})

window.addEventListener("focus", () => {
  if (guardEnabled) emitEvent("window_focus")
})

document.addEventListener("fullscreenchange", () => {
  if (guardEnabled && !document.fullscreenElement) {
    emitEvent("fullscreen_exit")
  }
})

// Basic devtools heuristic; logs suspicious change only.
setInterval(() => {
  if (!guardEnabled) return
  const threshold = 170
  const opened =
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  if (opened) {
    emitEvent("devtools_suspected")
  }
}, 3000)

window.addEventListener("message", (event) => {
  if (event.origin !== "http://localhost:3000") return
  if (event.source !== window) return
  const message = event.data
  if (!message || message.source !== "exam-web-app") return

  if (message.type === "EXAM_START_REQUEST") {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.WEBSITE_START_EXAM,
      payload: message.payload,
    })
  }

  if (message.type === "EXAM_END_REQUEST") {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.WEBSITE_END_EXAM,
      payload: message.payload,
    })
  }

  if (message.type === "EXAM_PING") {
    chrome.runtime.sendMessage(
      {
        type: MESSAGE_TYPES.WEBSITE_PING,
      },
      (response) => {
        postWebsiteStatus({
          active: !!response?.active,
          installed: true,
          reason: response?.reason ?? null,
        })
      },
    )
  }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message?.type) return

  if (message.type === MESSAGE_TYPES.WORKER_APPLY_GUARD) {
    applyGuard()
    sendResponse({ ok: true })
    return
  }

  if (message.type === MESSAGE_TYPES.WORKER_DISABLE_GUARD) {
    disableGuard(message.payload?.reason ?? "disabled")
    sendResponse({ ok: true })
    return
  }

  if (message.type === MESSAGE_TYPES.WORKER_STATUS) {
    sendResponse({ active: guardEnabled })
  }
})
