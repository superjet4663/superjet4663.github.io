import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/keybind.scss"
// @ts-ignore
import script from "./scripts/keybind.inline"
import { classNames } from "../util/lang"

interface Options {
  default?: string[]
}

export const KeybindAlias = {
  "cmd+/": "search",
  "cmd+\\": "home",
  "cmd+j": "curius",
  "cmd+b": "reader",
  "cmd+g": "graph",
  "cmd+o": "opener",
  "cmd+p": "connector",
  "cmd+i": "stacked notes",
  "cmd+y": "dark mode",
}

const defaultOptions: Options = {
  default: ["⌘ '", "⌃ '"],
}

const convert = (key: string) =>
  key
    .replace("cmd", "⌘")
    .replace("ctrl", "⌃")
    .replace("alt", "⌥")
    .replace("shift", "⇧")
    .replace("+", " ")

const revert = (key: string) =>
  key
    .replace("⌘", "cmd")
    .replace("⌃", "ctrl")
    .replace("⌥", "alt")
    .replace("⇧", "shift")
    .replace(" ", "--")
    .replace("+", "--")

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }
  const defaultKey = opts.default![0]
  
  const Keybind: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "keybind")} lang={"en"}>
        <kbd id="shortcut-key" data-mapping={JSON.stringify(opts.default?.map(revert))}>
          {defaultKey}
        </kbd>
        <div id="shortcut-container">
          <div id="shortcut-space">
            <div id="title">keyboard shortcuts</div>
            <ul id="shortcut-list">
              {Object.entries(KeybindAlias).map(([key, value]) => (
                <li>
                  <div
                    id="shortcuts"
                    data-key={convert(key).replace(" ", "--")}
                    data-value={value}
                  ></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }
  
  Keybind.css = style
  Keybind.afterDOMLoaded = script
  return Keybind
}) satisfies QuartzComponentConstructor