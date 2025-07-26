import { Date as DateComponent, getDate } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
//@ts-ignore
import script from "./scripts/content-meta.inline"
import style from "./styles/contentMeta.scss"
import { classNames } from "../util/lang"
import { FullSlug, resolveRelative } from "../util/path"
import { i18n } from "../i18n"
import { JSX, h } from "preact"
import { svgOptions } from "./svg"

type MetaProp = {
  title: string
  classes: string[]
  item: JSX.Element | JSX.Element[]
}

export default (() => {
  const ContentMeta: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
    let created: Date | undefined
    let modified: Date | undefined
    const { locale } = cfg

    if (fileData.dates) {
      created = getDate(cfg, fileData)
    }
    if (fileData.dates?.modified) {
      modified = fileData.dates?.["modified"]
    }
    const displayedTime = i18n(locale).components.contentMeta.readingTime({
      minutes: Math.ceil(fileData.readingTime?.minutes!),
      words: Math.ceil(fileData.readingTime?.words!),
    })

    const Li = ({ title, item, classes }: MetaProp) => {
      return (
        <li class={classNames(undefined, ...classes)}>
          <h2>{title}</h2>
          <div class="container">{item}</div>
        </li>
      )
    }

    const meta: MetaProp[] = []
    if (created !== undefined) {
      meta.push({
        title: "published",
        classes: ["published-time"],
        item: h(
          "span",
          {
            class: "page-creation",
            title: `Date of creation of the page content (${created})`,
          },
          [h("em", {}, [<DateComponent date={created} locale={locale} />])],
        ),
      })
    }
    if (modified !== undefined) {
      meta.push({
        title: "modified",
        classes: ["modified-time"],
        item: h(
          "span",
          { class: "page-modification" },
          h("em", {}, <DateComponent date={modified} locale={locale} />),
        ),
      })
    }
    // meta.push(
    //   { title: "reading time", classes: ["reading-time"], item: h("span", {}, [displayedTime]) },
    //   {
    //     title: "source",
    //     classes: ["readable-source"],
    //     item: [
    //       h(
    //         "a",
    //         {
    //           href: resolveRelative(fileData.slug!, (fileData.slug! + ".html.md") as FullSlug),
    //           target: "_blank",
    //           rel: "noopener noreferrer",
    //           class: "llm-source",
    //         },
    //         [h("span", { title: "see https://github.com/AnswerDotAI/llms-txt" }, ["llms.txt"])],
    //       ),
    //       h(
    //         "span",
    //         {
    //           type: "button",
    //           ariaLabel: "copy source",
    //           class: "clipboard-button",
    //           "data-href": resolveRelative(
    //             fileData.slug!,
    //             (fileData.slug! + ".html.md") as FullSlug,
    //           ),
    //         },

    //         h("svg", { ...svgOptions, viewbox: "0 -8 24 24", class: "copy-icon" }, [
    //           h("use", { href: "#github-copy" }),
    //         ]),
    //         h("svg", { ...svgOptions, viewbox: "0 -8 24 24", class: "check-icon" }, [
    //           h("use", { href: "#github-check" }),
    //         ]),
    //       ),
    //     ],
    //   },
    // )

    return (
      <ul class={classNames(displayClass, "content-meta")}>
        {meta.map((el) => (
          <Li {...el} />
        ))}
      </ul>
    )
  }

  ContentMeta.css = style
  ContentMeta.afterDOMLoaded = script

  return ContentMeta
}) satisfies QuartzComponentConstructor
