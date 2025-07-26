import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/palette.inline"
import style from "./styles/palette.scss"
import { classNames } from "../util/lang"

export default (() => {
  const placeholder = "Select an option..."
  const Palette: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <div class={classNames(displayClass, "palette")}>
      <search id="palette-container">
        <div id="space">
          <div class="input-container">
            <input
              autocomplete="off"
              id="bar"
              name="palette"
              type="text"
              aria-label={placeholder}
              placeholder={placeholder}
            />
          </div>
          <output id="result" />
          <ul id="helper">
            <li>
              <kbd>↑↓</kbd> to navigate
            </li>
            <li>
              <kbd>Enter</kbd> to open
            </li>
            <li data-quick-open>
              <kbd>→</kbd> to select
            </li>
            <li data-quick-open>
              <kbd>Ctrl + Alt + Enter</kbd> to open in panel
            </li>
            <li>
              <kbd>Esc</kbd> to dismiss
            </li>
          </ul>
        </div>
      </search>
    </div>
  )

  Palette.css = style
  Palette.afterDOMLoaded = script

  return Palette
}) satisfies QuartzComponentConstructor
