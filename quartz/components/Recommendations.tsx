import { LCG } from "../util/helpers"
import { classNames } from "../util/lang"
import { FilePath, resolveRelative, slugifyFilePath } from "../util/path"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() =>
  ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    let p = fileData.slug as string
    if (fileData.filePath) p = fileData.filePath
    const seed =
      slugifyFilePath(p as FilePath)
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) ?? 0
    const rng = new LCG(seed)

    const distributions = allFiles.filter(
      (f) => f.slug !== fileData.slug && !f.slug!.includes("university"),
    )

    // We will use 7 recs for now
    const recs = rng.shuffle(distributions).slice(0, 7)

    return (
      <section data-recs class={classNames(displayClass, "recommendations", "main-col")}>
        <h2 id="label" lang="en">
          You might like the following
        </h2>
        <menu class="overflow">
          {recs.map((file) => (
            <li>
              <a
                class="internal"
                data-no-popover
                href={resolveRelative(fileData.slug!, file.slug!)}
                data-slug={file.slug!}
              >
                {file.frontmatter?.title}
              </a>
            </li>
          ))}
        </menu>
      </section>
    )
  }) satisfies QuartzComponentConstructor
