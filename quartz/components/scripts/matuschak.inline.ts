// NOTE: We will import Matuschak's note view AFTER spa.inline.ts
// given that we will need to hijack the router
// We will only setup buttons here

// see ./spa.inline.ts
document.addEventListener("nav", async (ev) => {
  const button = document.getElementById("stacked-note-toggle") as HTMLButtonElement
  const container = document.getElementById("stacked-notes-container")
  const header = document.getElementsByClassName("header")[0] as HTMLElement

  if (!button || !container || !header) return
  const copyStacked = header.querySelector("span.stacked-copy") as HTMLElement

  const switchCheckState = async () => {
    const isChecked = button.getAttribute("aria-checked") === "true"
    const body = document.body
    const currentUrl = window.location.href

    if (!isChecked) {
      button.setAttribute("aria-checked", "true")
      container.classList.add("active")
      body.classList.add("stack-mode")
      header.classList.add("grid", "all-col")

      if (window.location.hash) {
        window.history.pushState("", document.title, currentUrl.split("#")[0])
      }
      window.stacked
        .navigate(new URL(`/${ev.detail.url}`, window.location.toString()))
        .then((data) => {
          if (data) window.location.reload()
        })
    } else {
      button.setAttribute("aria-checked", "false")
      container.classList.remove("active")
      body.classList.remove("stack-mode")
      header.classList.remove("grid", "all-col")
      window.stacked.destroy()
      window.location.reload()
    }
  }

  if (copyStacked) {
    function onClick() {
      const stackedNotes = window.stacked.getChain()
      let source = stackedNotes
      if (window.location.hostname.startsWith("wiki.opentajdid.com"))
        source = `https://wiki.opentajdid.com/?${stackedNotes}`

      navigator.clipboard.writeText(source).then(
        () => {
          copyStacked.blur()
          const use = copyStacked?.querySelector("svg") as SVGElement
          if (!use) return
          use.innerHTML = '<use href="#github-check"></use>'
          setTimeout(() => {
            use.innerHTML = '<use href="#github-copy"></use>'
          }, 2000)
        },
        (error) => console.error(error),
      )
    }

    copyStacked.addEventListener("click", onClick)
    window.addCleanup(() => copyStacked.removeEventListener("click", onClick))
  }

  if (window.location.hostname.startsWith("wiki.opentajdid.com")) return

  button.addEventListener("click", switchCheckState)
  window.addCleanup(() => {
    button.removeEventListener("click", switchCheckState)
  })
})
