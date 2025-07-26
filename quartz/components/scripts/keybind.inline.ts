import { registerEscapeHandler } from "./util"
import { navigateToRandomPage } from "./_randomPage.inline";


type Browser = "Safari" | "Chrome" | "Firefox" | "Edge" | "Opera" | "Other"

const detectBrowser = (): Browser => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
    return "Safari"
  } else if (userAgent.includes("edg")) {
    return "Edge"
  } else if (userAgent.includes("firefox")) {
    return "Firefox"
  } else if (userAgent.includes("opr") || userAgent.includes("opera")) {
    return "Opera"
  } else if (userAgent.includes("chrome")) {
    return "Chrome"
  }
  return "Other"
}

const isMacOS = (): boolean => {
  return window.navigator.userAgent.toLowerCase().includes("mac")
}

document.addEventListener("nav", async () => {
  const keybind = document.getElementsByClassName("keybind")[0] as HTMLDivElement | null
  if (!keybind) return
  
  const container = keybind.querySelector("#shortcut-container")
  const shortcutKey = keybind.querySelector("#shortcut-key") as HTMLElement
  
  const showContainer = () => {
    container?.classList.add("active")
  }
  
  const hideContainer = () => {
    container?.classList.remove("active")
  }
  
  async function shortcutHandler(e: HTMLElementEventMap["keydown"]) {
    if (!shortcutKey) return
    
    for (const binding of JSON.parse(shortcutKey.dataset.mapping as string)) {
      const [, key] = binding.split("--")
      if (e.key === key && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        const containerOpen = container?.classList.contains("active")
        containerOpen ? hideContainer() : showContainer()
        break
      }
    }
  }
  
  document.addEventListener("keydown", shortcutHandler)
  window.addCleanup(() => document.removeEventListener("keydown", shortcutHandler))
  
  registerEscapeHandler(keybind, hideContainer)
})

type MapAction = string | (() => void)
const _mapping: Map<string, MapAction> = new Map()

_mapping.set("\\", "/")
_mapping.set("j", "/curius")
_mapping.set("i", () => {
  const button = document.getElementById("stacked-note-toggle") as HTMLButtonElement
  if (button) button.click()
})

// Add darkmode toggle function
_mapping.set("y", () => {
  // First try clicking the darkmode button
  const darkmodeButtons = document.querySelectorAll(".darkmode")
  if (darkmodeButtons.length > 0) {
    (darkmodeButtons[0] as HTMLElement).click()
  } else {
    // Fallback: directly toggle theme if button not found
    const currentTheme = document.documentElement.getAttribute("saved-theme") || "light"
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("saved-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    
    // Emit theme change event
    const event = new CustomEvent("themechange", {
      detail: { theme: newTheme },
    })
    document.dispatchEvent(event)
  }
})

// Add reader mode toggle
_mapping.set("b", () => {
  const readerButton = document.querySelector(".reader-mode-button") as HTMLButtonElement
  if (readerButton) readerButton.click()
})

// Add graph toggle
_mapping.set("g", () => {
  const graphIcon = document.querySelector(".global-graph-icon") as HTMLElement
  if (graphIcon) {
    graphIcon.click()
  } else {
    // Fallback: manually toggle graph
    const graphComponent = document.querySelector('.graph') as HTMLElement
    if (graphComponent) {
      graphComponent.classList.toggle('active')
    }
  }
})

// Add search toggle
_mapping.set("k", () => {
  const searchButton = document.querySelector('a[title="Search"]') as HTMLAnchorElement
  if (searchButton) searchButton.click()
})

// Add random page navigation
_mapping.set("r", () => {
  navigateToRandomPage()
})

const aliases: Record<string, { mac: string; def: string }> = {
  search: { mac: "k", def: "k" },
  graph: { mac: "g", def: "g" },
  "dark mode": { mac: "y", def: "y" },
  reader: { mac: "b", def: "b" },
  "stacked notes": { mac: "i", def: "i" },
}

// Scroll amount in pixels per Ctrl-E/Y press
const SCROLL_AMOUNT = 100

document.addEventListener("nav", () => {
  const container = document.getElementById("shortcut-container")
  if (!container) return
  
  // mimic vim behaviour
  function scrollHandler(e: KeyboardEvent) {
    // Only handle if Ctrl is pressed (but not Cmd on Mac)
    if (!e.ctrlKey || e.metaKey) return
    
    if (e.ctrlKey && e.key === "d") {
      e.preventDefault()
      window.scrollBy({ top: SCROLL_AMOUNT, behavior: "smooth" })
    } else if (e.ctrlKey && e.key === "e") {
      e.preventDefault()
      window.scrollBy({ top: -SCROLL_AMOUNT, behavior: "smooth" })
    }
  }
  
  document.addEventListener("keydown", scrollHandler)
  window.addCleanup(() => document.removeEventListener("keydown", scrollHandler))
  
  const shortcuts = container.querySelectorAll(
    'ul[id="shortcut-list"] > li > div[id="shortcuts"]',
  ) as NodeListOf<HTMLElement>
  
  for (const short of shortcuts) {
    const binding = short.dataset.key as string
    const span = short.dataset.value as string
    let [prefix, key] = binding.split("--")
    const spanAliases = aliases[span]
    
    prefix = isMacOS() ? "⌘" : "⌃"
    const browser = detectBrowser()
    
    if (spanAliases) {
      const { mac, def } = spanAliases
      key = browser === "Safari" ? mac : def
    }
    
    short.innerHTML = `
<kbd class="clickable">${prefix} ${key}</kbd>
<span>${span}</span>
`
  }
  
  function shortcutHandler(e: HTMLElementEventMap["keydown"]) {
    if (_mapping.get(e.key) !== undefined && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      const action = _mapping.get(e.key)
      
      if (typeof action === "function") {
        action()
      } else if (typeof action === "string") {
        container?.classList.toggle("active", false)
        if (window.location.pathname === action) return
        window.spaNavigate(new URL(action, window.location.toString()))
      }
    }
  }
  
  document.addEventListener("keydown", shortcutHandler)
  window.addCleanup(() => document.removeEventListener("keydown", shortcutHandler))
})