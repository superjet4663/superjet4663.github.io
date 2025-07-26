import { closeReader } from "./util"

// TODO: Export directly to PDF and skip this step
async function toggleExportPdf() {
  try {
    window.print()
  } catch (error) {
    console.error("Failed to export PDF:", error)
    // Show error to user
    const toast = document.createElement("div")
    toast.className = "pdf-toast"
    toast.textContent = "Failed to export PDF. Please try again."
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }
}

function toggleReader(button: HTMLButtonElement) {
  const isActive = button.getAttribute("data-active") === "true"
  const readerView = document.querySelector(".reader") as HTMLElement
  if (!readerView) return
  const quartz = document.getElementById("quartz-root") as HTMLDivElement

  if (!isActive) {
    readerView.classList.add("active")
    button.setAttribute("data-active", "true")
    quartz.style.overflow = "hidden"
    quartz.style.maxHeight = "0px"
  } else {
    closeReader(readerView)
  }
}

function setupToolbar() {
  const toolbar = document.querySelector(".toolbar")
  if (!toolbar) return

  const toolbarContent = toolbar.querySelector(".toolbar-content")
  if (!toolbarContent) return

  // reader section
  const readerButton = toolbarContent.querySelector("#reader-button") as HTMLButtonElement
  if (readerButton) {
    const reader = () => toggleReader(readerButton)
    readerButton.addEventListener("click", reader)
    window.addCleanup(() => readerButton.removeEventListener("click", reader))
  }

  // reader section
  const pdfButton = toolbarContent.querySelector("#pdf-button") as HTMLButtonElement
  if (pdfButton) {
    pdfButton.addEventListener("click", toggleExportPdf)
    window.addCleanup(() => pdfButton.removeEventListener("click", toggleExportPdf))
  }
}

window.addEventListener("resize", setupToolbar)
document.addEventListener("nav", setupToolbar)
