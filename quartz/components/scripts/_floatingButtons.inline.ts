// Fixed floating buttons script
import { navigateToRandomPage } from "./_randomPage.inline";
// Global variables to track state
let activeModal: HTMLElement | null = null
let currentCleanup: (() => void) | null = null
// Shortcut sheet function
function showShortcutSheet() {
  if (activeModal) return

  const modal = document.createElement('div')
  activeModal = modal
  modal.className = 'shortcut-sheet-modal'

  const content = document.createElement('div')
  content.className = 'shortcut-sheet-content'

  content.innerHTML = `
    <h3>Command Palette <kbd class="retro-key">Ctrl /</kbd></h3>
    <div class="shortcut-list">
      <div class="shortcut-item" data-shortcut="search">
        <span class="shortcut-keys">
          <kbd class="retro-key">⌘</kbd> / <kbd class="retro-key">Ctrl</kbd> + <kbd class="retro-key">K</kbd>
        </span>
        <span class="shortcut-desc">Search</span>
      </div>
      <div class="shortcut-item" data-shortcut="home">
        <span class="shortcut-keys">
          <kbd class="retro-key">⌘</kbd> / <kbd class="retro-key">Ctrl</kbd> + <kbd class="retro-key">\\</kbd>
        </span>
        <span class="shortcut-desc">Home</span>
      </div>
      <div class="shortcut-item" data-shortcut="curius">
        <span class="shortcut-keys">
          <kbd class="retro-key">⌘</kbd> / <kbd class="retro-key">Ctrl</kbd> + <kbd class="retro-key">J</kbd>
        </span>
        <span class="shortcut-desc">Curius</span>
      </div>
      <div class="shortcut-item" data-shortcut="reader">
        <span class="shortcut-keys">
          <kbd class="retro-key">⌘</kbd> / <kbd class="retro-key">Ctrl</kbd> + <kbd class="retro-key">B</kbd>
        </span>
        <span class="shortcut-desc">Reader Mode</span>
      </div>
      <div class="shortcut-item" data-shortcut="graph">
        <span class="shortcut-keys">
          <kbd class="retro-key">⌘</kbd> / <kbd class="retro-key">Ctrl</kbd> + <kbd class="retro-key">G</kbd>
        </span>
        <span class="shortcut-desc">Global Graph</span>
      </div>
      <div class="shortcut-item" data-shortcut="stacked">
        <span class="shortcut-keys">
          <kbd class="retro-key">⌘</kbd> / <kbd class="retro-key">Ctrl</kbd> + <kbd class="retro-key">I</kbd>
        </span>
        <span class="shortcut-desc">Stacked Notes</span>
      </div>
      <div class="shortcut-item" data-shortcut="darkmode">
        <span class="shortcut-keys">
          <kbd class="retro-key">⌘</kbd> / <kbd class="retro-key">Ctrl</kbd> + <kbd class="retro-key">Y</kbd>
        </span>
        <span class="shortcut-desc">Dark Mode</span>
      </div>
      <div class="shortcut-item" data-shortcut="random">
        <span class="shortcut-keys">
          <kbd class="retro-key">⌘</kbd> / <kbd class="retro-key">Ctrl</kbd> + <kbd class="retro-key">R</kbd>
        </span>
        <span class="shortcut-desc">Random Page</span>
      </div>
    </div>`
  

  const closeBtn = document.createElement('button')
  closeBtn.className = 'shortcut-sheet-close'
  closeBtn.innerHTML = '×'
  content.insertBefore(closeBtn, content.firstChild)
  modal.appendChild(content)

  // Unified close function
  function closeModal(executeAction?: string) {
    if (!activeModal) return

    document.removeEventListener('keydown', handleEsc)
    modal.removeEventListener('mousedown', handleOutsideClick)
    closeBtn.removeEventListener('click', handleButtonClick)
    content.removeEventListener('click', handleShortcutClick)

    activeModal.remove()
    activeModal = null

    // Execute action if specified
    if (executeAction) {
      // Small delay to ensure modal is closed first
      setTimeout(() => {
        executeShortcutAction(executeAction)
      }, 100)
    }
  }

  // Handle ESC close
  function handleEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeModal()
    }
  }

  // Handle outside click close
  function handleOutsideClick(e: MouseEvent) {
    if (e.target === modal && e.currentTarget === modal) {
      e.preventDefault()
      e.stopPropagation()
      closeModal()
    }
  }

  // Handle close button click
  function handleButtonClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    closeModal()
  }

  // Handle shortcut item click
  function handleShortcutClick(e: MouseEvent) {
    const shortcutItem = (e.target as Element).closest('.shortcut-item')
    if (!shortcutItem) return

    const action = shortcutItem.getAttribute('data-shortcut')
    if (action) {
      closeModal(action)
    }
  }

  document.addEventListener('keydown', handleEsc)
  modal.addEventListener('mousedown', handleOutsideClick)
  closeBtn.addEventListener('click', handleButtonClick)
  content.addEventListener('click', handleShortcutClick)

  document.body.appendChild(modal)
}
// Execute shortcut actions
function executeShortcutAction(action: string) {
  switch (action) {
    case 'search':
      const searchEvent = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(searchEvent)
      break

    case 'home':
      if (window.spaNavigate) {
        window.spaNavigate(new URL("/", window.location.toString()))
      } else {
        window.location.href = "/"
      }
      break

    case 'curius':
      if (window.spaNavigate) {
        window.spaNavigate(new URL("/curius", window.location.toString()))
      } else {
        window.location.href = "/curius"
      }
      break

    case 'graph':
      const graphEvent = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(graphEvent)
      break

    case 'reader':
      const readerEvent = new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(readerEvent)
      break

    case 'stacked':
      const stackedEvent = new KeyboardEvent('keydown', {
        key: 'i',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(stackedEvent)
      break

    case 'darkmode':
      const darkmodeEvent = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(darkmodeEvent)
      break

    case 'random':
      navigateToRandomPage()
      break
  }
}
// Setup keyboard shortcuts
let keyboardShortcutsInitialized = false
function setupKeyboardShortcuts() {
  // Prevent duplicate initialization
  if (keyboardShortcutsInitialized) return
  keyboardShortcutsInitialized = true

  function handleKeyPress(e: KeyboardEvent) {
    // Handle Ctrl/Cmd+/ for command palette
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      showShortcutSheet()
      return
    }
  }

  document.addEventListener('keydown', handleKeyPress)
  window.addCleanup?.(() => {
    document.removeEventListener('keydown', handleKeyPress)
    keyboardShortcutsInitialized = false
  })
}
function setupFloatingButtons() {
  console.log('Setting up floating buttons...')

  // Clear previous setup
  if (currentCleanup) {
    currentCleanup()
    currentCleanup = null
  }

  // Always setup keyboard shortcuts on all pages
  setupKeyboardShortcuts()

  let retryCount = 0
  const maxRetries = 10

  // Wait for elements to be available
  const waitForElements = () => {
    const buttonGroups = document.querySelectorAll<HTMLElement>('.button-group')
    const buttons = document.querySelectorAll<HTMLElement>('[data-action]')

    if (buttonGroups.length === 0 && buttons.length === 0) {
      retryCount++
      if (retryCount < maxRetries) {
        // Retry after a short delay if elements aren't found
        setTimeout(waitForElements, 100)
      } else {
        console.log('Max retries reached - no floating buttons found')
      }
      return
    }

    // Handle button clicks with proper event delegation
    function handleButtonClick(e: Event) {
      e.preventDefault()
      e.stopPropagation()

      const button = (e.target as Element).closest('[data-action]') as HTMLElement
      if (!button) return

      const action = button.getAttribute('data-action')
      console.log('Action:', action)

      const footer = document.querySelector('.footer')

      switch (action) {
        case 'scrollTop':
          globalThis.scrollTo({ top: 0, left: 0, behavior: "smooth" })
          break

        case 'scrollBottom':
          if (footer) {
            footer.scrollIntoView({ behavior: 'smooth' })
          } else {
            globalThis.scrollTo({ 
              top: document.body.scrollHeight, 
              left: 0, 
              behavior: "smooth" 
            })
          }
          break

        case 'shortcuts':
          showShortcutSheet()
          break

        case 'randomPgFloating':
          navigateToRandomPage()
          break

        default:
          console.log('Unknown action:', action)
      }
    }

    // Use event delegation on document body for better reliability
    const eventHandler = (e: Event) => {
      const target = e.target as Element
      if (target.closest('.floating-button[data-action]') || target.closest('[data-action]')) {
        handleButtonClick(e)
      }
    }

    // Add event listener to document body with event delegation
    document.body.addEventListener('click', eventHandler)

    // Also add direct listeners to button groups as backup
    buttonGroups.forEach(group => {
      group.addEventListener('click', handleButtonClick)
    })

    // Setup keyboard shortcuts
    setupKeyboardShortcuts()

    // Save cleanup function
    currentCleanup = () => {
      document.body.removeEventListener('click', eventHandler)
      buttonGroups.forEach(group => {
        group.removeEventListener('click', handleButtonClick)
      })
      if (activeModal) {
        activeModal.remove()
        activeModal = null
      }
    }
  }

  // Start waiting for elements
  waitForElements()
}
// Initialize on DOM load and navigation
document.addEventListener('DOMContentLoaded', setupFloatingButtons)
document.addEventListener('nav', setupFloatingButtons)
// Handle broken links
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.broken-link').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault()
    })
  })
})