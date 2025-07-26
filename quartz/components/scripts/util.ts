import { FullSlug, getFullSlug, resolveRelative } from "../../util/path"

export function registerEscapeHandler(outsideContainer: HTMLElement | null, cb: () => void) {
  if (!outsideContainer) return
  function click(this: HTMLElement, e: HTMLElementEventMap["click"]) {
    if (e.target !== this) return
    e.preventDefault()
    e.stopPropagation()
    cb()
  }

  function esc(e: HTMLElementEventMap["keydown"]) {
    if (!e.key.startsWith("Esc")) return
    e.preventDefault()
    cb()
  }

  outsideContainer?.addEventListener("click", click)
  window.addCleanup(() => outsideContainer?.removeEventListener("click", click))
  document.addEventListener("keydown", esc)
  window.addCleanup(() => document.removeEventListener("keydown", esc))
}

export function removeAllChildren(node: HTMLElement) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

export function registerMouseHover(el: HTMLElement, ...classList: string[]) {
  const onMouseEnter = () => el.classList.add(...classList)
  const onMouseLeave = () => el.classList.remove(...classList)

  registerEvents(el, ["mouseenter", onMouseEnter], ["mouseleave", onMouseLeave])
}

type EventType = HTMLElementEventMap[keyof HTMLElementEventMap]
type EventHandlers<E extends EventType> = (evt: E) => any

export function registerEvents<
  T extends Document | HTMLElement | null,
  E extends keyof HTMLElementEventMap,
>(element: T, ...events: [E, EventHandlers<HTMLElementEventMap[E]>][]) {
  if (!element) return

  events.forEach(([event, cb]) => {
    const listener: EventListener = (evt) => cb(evt as HTMLElementEventMap[E])
    element.addEventListener(event, listener)
    window.addCleanup(() => element.removeEventListener(event, listener))
  })
}

export function decodeString(el: HTMLSpanElement, targetString: string, duration: number = 1000) {
  const start = performance.now()
  const end = start + duration

  function update() {
    const current = performance.now()
    const progress = (current - start) / duration
    const currentIndex = Math.floor(progress * targetString.length)

    if (current < end) {
      let decodingString =
        targetString.substring(0, currentIndex) +
        getRandomString(targetString.length - currentIndex)
      el.textContent = decodingString
      requestAnimationFrame(update)
    } else {
      el.textContent = targetString
    }
  }

  requestAnimationFrame(update)
}

export function getRandomString(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function isInViewport(element: HTMLElement, buffer: number = 100) {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= -buffer &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + buffer
  )
}

// Computes an offset such that setting `top` on elemToAlign will put it
// in vertical alignment with targetAlignment.
function computeOffsetForAlignment(elemToAlign: HTMLElement, targetAlignment: HTMLElement) {
  const elemRect = elemToAlign.getBoundingClientRect()
  const targetRect = targetAlignment.getBoundingClientRect()
  const parentRect = elemToAlign.parentElement?.getBoundingClientRect() || elemRect
  return targetRect.top - parentRect.top
}

// Get bounds for the sidenote positioning
function getBounds(parent: HTMLElement, child: HTMLElement): { min: number; max: number } {
  const containerRect = parent.getBoundingClientRect()
  const sidenoteRect = child.getBoundingClientRect()

  return {
    min: 0,
    max: containerRect.height - sidenoteRect.height,
  }
}

export function updatePosition(ref: HTMLElement, child: HTMLElement, parent: HTMLElement) {
  // Calculate ideal position
  let referencePosition = computeOffsetForAlignment(child, ref)

  // Get bounds for this sidenote
  const bounds = getBounds(parent, child)

  // Clamp the position within bounds
  referencePosition = Math.max(referencePosition, Math.min(bounds.min, bounds.max))

  // Apply position
  child.style.top = `${referencePosition}px`
}

export type CollapsedState = "true" | "false"

const collapseId = (window: Window, id: string): string =>
  `${getFullSlug(window).replace("/", "--")}-${id}`

export function getCollapsedState(window: Window, id: string): CollapsedState | null {
  return localStorage.getItem(collapseId(window, id)) as CollapsedState | null
}
export function setCollapsedState(window: Window, id: string, state: CollapsedState) {
  localStorage.setItem(collapseId(window, id), state)
}

export function setHeaderState(
  button: HTMLElement,
  content: HTMLElement,
  wrapper: HTMLElement,
  collapsed: boolean,
) {
  button.setAttribute("aria-expanded", collapsed ? "false" : "true")
  button.classList.toggle("collapsed", collapsed)
  content.classList.toggle("collapsed", collapsed)
  wrapper.classList.toggle("collapsed", collapsed)
}

export function closeReader(readerView: HTMLElement | null) {
  if (!readerView) return
  readerView.classList.remove("active")
  const allHr = document.querySelectorAll("hr")
  const quartz = document.getElementById("quartz-root")
  if (!allHr || !quartz) return
  allHr.forEach((hr) => (hr.style.visibility = "visible"))
  quartz.style.overflow = ""
  quartz.style.maxHeight = ""
}

export function debounce(fn: Function, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export interface DagNode {
  slug: string
  title: string
  contents: HTMLElement[]
  note: HTMLElement
  anchor?: HTMLElement | null
  hash?: string
}

export class Dag {
  private nodes: Map<string, DagNode>
  private order: string[] // Maintain order of nodes

  constructor() {
    this.nodes = new Map()
    this.order = []
  }

  addNode(node: DagNode) {
    const { slug } = node
    if (!this.nodes.has(slug)) {
      this.nodes.set(slug, node)
      this.order.push(slug)
    }
    return this.nodes.get(slug)!
  }

  getOrderedNodes(): DagNode[] {
    return this.order.map((slug) => this.nodes.get(slug)!).filter(Boolean)
  }

  truncateAfter(slug: string) {
    const idx = this.order.indexOf(slug)
    if (idx === -1) return

    // Remove all nodes after idx from both order and nodes map
    const removed = this.order.splice(idx + 1)
    removed.forEach((slug) => this.nodes.delete(slug))
  }

  clear() {
    this.nodes.clear()
    this.order = []
  }

  has(slug: string): boolean {
    return this.nodes.has(slug)
  }

  get(slug: string): DagNode | undefined {
    return this.nodes.get(slug)
  }

  getTail(): DagNode | undefined {
    const lastSlug = this.order[this.order.length - 1]
    return lastSlug ? this.nodes.get(lastSlug) : undefined
  }
}

// AliasRedirect emits HTML redirects which also have the link[rel="canonical"]
// containing the URL it's redirecting to.
// Extracting it here with regex is _probably_ faster than parsing the entire HTML
// with a DOMParser effectively twice (here and later in the SPA code), even if
// way less robust - we only care about our own generated redirects after all.
const canonicalRegex = /<link rel="canonical" href="([^"]*)">/
export async function fetchCanonical(url: URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${url}`, init)
  if (!res.headers.get("content-type")?.startsWith("text/html")) {
    return res
  }
  // reading the body can only be done once, so we need to clone the response
  // to allow the caller to read it if it's was not a redirect
  const text = await res.clone().text()
  const [_, redirect] = text.match(canonicalRegex) ?? []
  return redirect ? fetch(`${new URL(redirect, url)}`) : res
}

export function isBrowser() {
  return typeof window !== "undefined"
}

const contextWindowWords = 30
export const tokenizeTerm = (term: string) => {
  const tokens = term.split(/\s+/).filter((t) => t.trim() !== "")
  const tokenLen = tokens.length
  if (tokenLen > 1) {
    for (let i = 1; i < tokenLen; i++) {
      tokens.push(tokens.slice(0, i + 1).join(" "))
    }
  }

  return tokens.sort((a, b) => b.length - a.length) // always highlight longest terms first
}

export function highlight(searchTerm: string, text: string, trim?: boolean) {
  const tokenizedTerms = tokenizeTerm(searchTerm)
  let tokenizedText = text.split(/\s+/).filter((t) => t !== "")

  let startIndex = 0
  let endIndex = tokenizedText.length - 1
  if (trim) {
    const includesCheck = (tok: string) =>
      tokenizedTerms.some((term) => tok.toLowerCase().startsWith(term.toLowerCase()))
    const occurrencesIndices = tokenizedText.map(includesCheck)

    let bestSum = 0
    let bestIndex = 0
    for (let i = 0; i < Math.max(tokenizedText.length - contextWindowWords, 0); i++) {
      const window = occurrencesIndices.slice(i, i + contextWindowWords)
      const windowSum = window.reduce((total, cur) => total + (cur ? 1 : 0), 0)
      if (windowSum >= bestSum) {
        bestSum = windowSum
        bestIndex = i
      }
    }

    startIndex = Math.max(bestIndex - contextWindowWords, 0)
    endIndex = Math.min(startIndex + 2 * contextWindowWords, tokenizedText.length - 1)
    tokenizedText = tokenizedText.slice(startIndex, endIndex)
  }

  const slice = tokenizedText
    .map((tok) => {
      // see if this tok is prefixed by any search terms
      for (const searchTok of tokenizedTerms) {
        if (tok.toLowerCase().includes(searchTok.toLowerCase())) {
          const regex = new RegExp(searchTok.toLowerCase(), "gi")
          return tok.replace(regex, `<span class="highlight">$&</span>`)
        }
      }
      return tok
    })
    .join(" ")

  return `${startIndex === 0 ? "" : "..."}${slice}${
    endIndex === tokenizedText.length - 1 ? "" : "..."
  }`
}

// To be used with search and everything else with flexsearch
export const encode = (str: string) => str.toLowerCase().split(/([^a-z]|[^\x00-\x7F])/)

export function createSidePanel(asidePanel: HTMLDivElement, ...inner: HTMLElement[]) {
  const pageHeader = document.querySelector<HTMLDivElement>("main > section[class~='page-header']")
  if (!asidePanel || !pageHeader) console.error("asidePanel must not be null")

  // Calculate and set the top position based on page header
  const headerRect = pageHeader!.getBoundingClientRect()
  const topPosition = headerRect.top + window.scrollY
  asidePanel.style.top = `${topPosition}px`
  asidePanel.classList.add("active")
  removeAllChildren(asidePanel)

  const header = document.createElement("div")
  header.classList.add("sidepanel-header", "all-col")

  const closeButton = document.createElement("button")
  closeButton.classList.add("close-button")
  closeButton.ariaLabel = "close button"
  closeButton.title = "close button"
  closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width=16 height=16 viewbox="0 0 24 24" fill="currentColor" stroke="currentColor"><use href="#close-button"></svg>`
  function onCloseClick() {
    removeAllChildren(asidePanel)
    asidePanel.classList.remove("active")
  }
  closeButton.addEventListener("click", onCloseClick)
  window.addCleanup(() => closeButton.removeEventListener("click", onCloseClick))

  const redirectButton = document.createElement("button")
  redirectButton.classList.add("redirect-button")
  redirectButton.ariaLabel = "redirect to page"
  redirectButton.title = "redirect to page"
  redirectButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width=16 height=16 viewbox="0 0 24 24" fill="var(--gray)" stroke="none"><use href="#triple-dots"></svg>`
  function onRedirectClick() {
    window.spaNavigate(
      new URL(
        resolveRelative(getFullSlug(window), asidePanel.dataset.slug as FullSlug),
        window.location.toString(),
      ),
    )
  }
  redirectButton.addEventListener("click", onRedirectClick)
  window.addCleanup(() => redirectButton.removeEventListener("click", onRedirectClick))

  header.appendChild(redirectButton)
  header.appendChild(closeButton)

  const sideInner = document.createElement("div")
  sideInner.classList.add("sidepanel-inner")
  sideInner.append(...inner, header)
  asidePanel.appendChild(sideInner)

  if (window.mermaid) {
    const nodes = sideInner.querySelectorAll<HTMLDivElement>("pre > code.mermaid")
    if (nodes.length === 0) return
    window.mermaid.run({ nodes }).then(() => {
      mermaidViewer(nodes)
    })
  }

  return sideInner
}

interface Position {
  x: number
  y: number
}

class DiagramPanZoom {
  private isDragging = false
  private startPan: Position = { x: 0, y: 0 }
  private currentPan: Position = { x: 0, y: 0 }
  private scale = 1
  private readonly MIN_SCALE = 0.5
  private readonly MAX_SCALE = 3

  cleanups: (() => void)[] = []

  constructor(
    private container: HTMLElement,
    private content: HTMLElement,
  ) {
    this.setupEventListeners()
    this.setupNavigationControls()
    this.resetTransform()
  }

  private setupEventListeners() {
    // Mouse drag events
    const mouseDownHandler = this.onMouseDown.bind(this)
    const mouseMoveHandler = this.onMouseMove.bind(this)
    const mouseUpHandler = this.onMouseUp.bind(this)
    const resizeHandler = this.resetTransform.bind(this)

    this.container.addEventListener("mousedown", mouseDownHandler)
    document.addEventListener("mousemove", mouseMoveHandler)
    document.addEventListener("mouseup", mouseUpHandler)
    window.addEventListener("resize", resizeHandler)

    this.cleanups.push(
      () => this.container.removeEventListener("mousedown", mouseDownHandler),
      () => document.removeEventListener("mousemove", mouseMoveHandler),
      () => document.removeEventListener("mouseup", mouseUpHandler),
      () => window.removeEventListener("resize", resizeHandler),
    )
  }

  cleanup() {
    for (const cleanup of this.cleanups) {
      cleanup()
    }
  }

  private setupNavigationControls() {
    const controls = document.createElement("div")
    controls.className = "mermaid-controls"

    // Zoom controls
    const zoomIn = this.createButton("+", () => this.zoom(0.1))
    const zoomOut = this.createButton("-", () => this.zoom(-0.1))
    const resetBtn = this.createButton("Reset", () => this.resetTransform())

    controls.appendChild(zoomOut)
    controls.appendChild(resetBtn)
    controls.appendChild(zoomIn)

    this.container.appendChild(controls)
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button")
    button.textContent = text
    button.className = "mermaid-control-button"
    button.addEventListener("click", onClick)
    window.addCleanup(() => button.removeEventListener("click", onClick))
    return button
  }

  private onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return // Only handle left click
    this.isDragging = true
    this.startPan = { x: e.clientX - this.currentPan.x, y: e.clientY - this.currentPan.y }
    this.container.style.cursor = "grabbing"
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return
    e.preventDefault()

    this.currentPan = {
      x: e.clientX - this.startPan.x,
      y: e.clientY - this.startPan.y,
    }

    this.updateTransform()
  }

  private onMouseUp() {
    this.isDragging = false
    this.container.style.cursor = "grab"
  }

  private zoom(delta: number) {
    const newScale = Math.min(Math.max(this.scale + delta, this.MIN_SCALE), this.MAX_SCALE)

    // Zoom around center
    const rect = this.content.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const scaleDiff = newScale - this.scale
    this.currentPan.x -= centerX * scaleDiff
    this.currentPan.y -= centerY * scaleDiff

    this.scale = newScale
    this.updateTransform()
  }

  private updateTransform() {
    this.content.style.transform = `translate(${this.currentPan.x}px, ${this.currentPan.y}px) scale(${this.scale})`
  }

  private resetTransform() {
    this.scale = 1
    const svg = this.content.querySelector("svg")!
    this.currentPan = {
      x: svg.getBoundingClientRect().width / 2,
      y: svg.getBoundingClientRect().height / 2,
    }
    this.updateTransform()
  }
}

export function mermaidViewer(nodes: NodeListOf<HTMLDivElement>) {
  for (let i = 0; i < nodes.length; i++) {
    const codeBlock = nodes[i] as HTMLElement
    const pre = codeBlock.parentElement as HTMLPreElement
    const clipboardBtn = pre.querySelector(".clipboard-button") as HTMLButtonElement
    const expandBtn = pre.querySelector(".expand-button") as HTMLButtonElement

    const clipboardStyle = window.getComputedStyle(clipboardBtn)
    const clipboardWidth =
      clipboardBtn.offsetWidth +
      parseFloat(clipboardStyle.marginLeft || "0") +
      parseFloat(clipboardStyle.marginRight || "0")

    // Set expand button position
    expandBtn.style.right = `calc(${clipboardWidth}px + 0.3rem)`
    pre.prepend(expandBtn)

    // query popup container
    const popupContainer = pre.querySelector("#mermaid-container") as HTMLElement
    if (!popupContainer) return

    let panZoom: DiagramPanZoom | null = null
    function showMermaid() {
      const container = popupContainer.querySelector("#mermaid-space") as HTMLElement
      const content = popupContainer.querySelector(".mermaid-content") as HTMLElement
      if (!content) return
      removeAllChildren(content)

      // Clone the mermaid content
      const mermaidContent = codeBlock.querySelector("svg")!.cloneNode(true) as SVGElement
      content.appendChild(mermaidContent)

      // Show container
      popupContainer.classList.add("active")
      container.style.cursor = "grab"

      // Initialize pan-zoom after showing the popup
      panZoom = new DiagramPanZoom(container, content)
    }

    function hideMermaid() {
      popupContainer.classList.remove("active")
      panZoom?.cleanup()
      panZoom = null
    }

    expandBtn.addEventListener("click", showMermaid)
    registerEscapeHandler(popupContainer, hideMermaid)

    window.addCleanup(() => {
      panZoom?.cleanup()
      expandBtn.removeEventListener("click", showMermaid)
    })
  }
}
