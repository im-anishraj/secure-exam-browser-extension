import { MESSAGE_TYPES } from "../shared/messages.js"

const statusNode = document.getElementById("status")
const quitButton = document.getElementById("quit")
const refreshButton = document.getElementById("refresh")

const refreshStatus = () => {
  chrome.runtime.sendMessage({ type: MESSAGE_TYPES.WEBSITE_PING }, (response) => {
    if (!response) {
      statusNode.textContent = "Status unavailable"
      return
    }
    statusNode.textContent = response.active
      ? "Exam mode is active"
      : `Exam mode is inactive (${response.reason ?? "idle"})`
  })
}

quitButton?.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Emergency quit will end your active exam session. Continue?",
  )
  if (!confirmed) return
  chrome.runtime.sendMessage({ type: MESSAGE_TYPES.POPUP_QUIT }, () => {
    refreshStatus()
  })
})

refreshButton?.addEventListener("click", refreshStatus)
refreshStatus()
