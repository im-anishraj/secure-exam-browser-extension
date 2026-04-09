const STYLE_ID = "exam-guard-style"

let active = false
const listeners = []

const preventDefault = (event) => {
  event.preventDefault()
  event.stopPropagation()
}

const onKeyDown = (event) => {
  const key = event.key.toLowerCase()
  const ctrlOrMeta = event.ctrlKey || event.metaKey

  if (ctrlOrMeta && ["c", "x", "v", "a", "u", "s", "p"].includes(key)) {
    preventDefault(event)
  }
  if (event.key === "F12") {
    preventDefault(event)
  }
}

const register = (target, type, handler, options = true) => {
  target.addEventListener(type, handler, options)
  listeners.push(() => target.removeEventListener(type, handler, options))
}

const ensureSelectionStyle = () => {
  if (document.getElementById(STYLE_ID)) {
    return
  }
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

const removeSelectionStyle = () => {
  const style = document.getElementById(STYLE_ID)
  if (style) {
    style.remove()
  }
}

export const applyRestrictions = () => {
  if (active) return
  active = true
  ensureSelectionStyle()
  register(window, "contextmenu", preventDefault)
  register(window, "copy", preventDefault)
  register(window, "cut", preventDefault)
  register(window, "paste", preventDefault)
  register(window, "selectstart", preventDefault)
  register(window, "dragstart", preventDefault)
  register(window, "keydown", onKeyDown)
}

export const clearRestrictions = () => {
  active = false
  while (listeners.length) {
    const off = listeners.pop()
    off?.()
  }
  removeSelectionStyle()
}
