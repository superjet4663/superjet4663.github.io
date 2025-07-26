import { isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps, QuartzComponentConstructor } from "./types"
import { GlobalConfiguration } from "../cfg"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

export function byDateAndAlphabetical(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort folders first
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexicographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

type Props = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

interface Options {
  highlightTags: string[]
}

const defaultOptions: Options = { highlightTags: [] }

export default ((userOpts?: Options) => {
  const opts = { ...defaultOptions, ...userOpts }

  const PageList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
    const sorter = sort ?? byDateAndAlphabetical(cfg)
    let list = allFiles.sort(sorter)
    if (limit) {
      list = list.slice(0, limit)
    }

    return (
      <ul class="section-ul">
        {list.map((page, idx) => {
          const title = page.frontmatter?.title
          const tags = page.frontmatter?.tags ?? []
          const hiTags = opts.highlightTags.filter((v) => tags.includes(v))

          return (
            <li class="section-li" data-index={idx}>
              <a
                class="note-link"
                href={resolveRelative(fileData.slug!, page.slug!)}
                data-list={true}
                data-tags={tags.join(",")}
              >
                <div class="note-grid">
                  {page.dates && (
                    <div class="meta">
                      <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                    </div>
                  )}
                  <div class="desc">{title}</div>
                  {hiTags.length > 0 ? (
                    <menu class="tag-highlights">
                      {hiTags.map((el) => (
                        <li class="tag" data-tag={el}>
                          {el}
                        </li>
                      ))}
                    </menu>
                  ) : (
                    <></>
                  )}
                </div>
              </a>
            </li>
          )
        })}
      </ul>
    )
  }

  return PageList
}) satisfies QuartzComponentConstructor
