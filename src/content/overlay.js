const OVERLAY_ID = "exam-guard-active-overlay"

export const showOverlay = (text = "Exam Mode is Active") => {
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

export const hideOverlay = () => {
  const node = document.getElementById(OVERLAY_ID)
  if (node) {
    node.remove()
  }
}
