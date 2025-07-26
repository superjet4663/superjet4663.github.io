import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import path from "path"
import style from "../styles/listPage.scss"
import PageListConstructor, { byDateAndAlphabetical, SortFn } from "../PageList"
import { stripSlashes, simplifySlug, joinSegments, FullSlug, splitAnchor } from "../../util/path"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { QuartzPluginData } from "../../plugins/vfile"
import EvergreenConstructor from "../Evergreen"
import { FileTrieNode } from "../../util/fileTrie"

interface FolderContentOptions {
  /**
   * Sort function for the pages
   */
  sort?: SortFn
  /**
   * File extensions to include (e.g., [".md", ".pdf", ".ipynb"])
   * If not provided, defaults to showing all files
   */
  include?: (string | RegExp)[]
  /**
   * File extensions to exclude
   * If not provided, no extensions are excluded
   */
  exclude?: (string | RegExp)[]
}

function extensionFilterFn(opts: FolderContentOptions): (filePath: string) => boolean {
  const matchesPattern = (filePath: string, pattern: string | RegExp): boolean => {
    if (pattern instanceof RegExp) {
      return pattern.test(filePath)
    }
    // For string patterns, treat them as exact matches (could be file extensions or exact names)
    if (pattern.startsWith(".")) {
      // If it starts with a dot, treat as extension
      return filePath.toLowerCase().endsWith(pattern.toLowerCase())
    }
    return filePath === pattern
  }

  return (filePath: string): boolean => {
    if (!opts.include && !opts.exclude) return true
    if (opts.exclude?.some((pattern) => matchesPattern(filePath, pattern))) return false
    return opts.include?.some((pattern) => matchesPattern(filePath, pattern)) ?? true
  }
}

const defaultOptions: FolderContentOptions = {
  include: undefined,
  exclude: undefined,
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  let trie: FileTrieNode<
    QuartzPluginData & {
      slug: string
      title: string
      filePath: string
    }
  >

  const shouldIncludeFile = extensionFilterFn(options)

  const tags = ["axis", "counter", "incubating", "insight"]
  // NOTE: we will always add the generated tags "folder" for better distinction
  const PageList = PageListConstructor({ highlightTags: [...tags, "folder"] })
  const Evergreen = EvergreenConstructor({
    lg: ["Axis/Islamic-World-History", "Axis/Allah"],
    sm: [
      "Axis/Islamic-History",
    ],
    tags,
  })

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, ctx, cfg } = props
    // Initialize trie if not already initialized
    if (!trie) {
      trie = new FileTrieNode([])
      allFiles.forEach((file) => {
        if (file.frontmatter) {
          trie.add({
            ...file,
            slug: file.slug!,
            title: file.frontmatter.title,
            filePath: file.filePath!,
          })
        }
      })
    }

    const folderSlug = stripSlashes(simplifySlug(fileData.slug!))
    const entries: QuartzPluginData[] = []
    const processedPaths = new Set<string>()

    // Find immediate children and subfolders from ctx.allSlugs
    const folderParts = folderSlug.split(path.posix.sep)
    const subfolders = new Set<string>()

    // Process all slugs to find files and folders
    for (const slug of ctx.allSlugs) {
      const slugParts = stripSlashes(simplifySlug(slug)).split(path.posix.sep)

      // Check if this slug is under our current folder
      if (!slug.startsWith(folderSlug) || slug === folderSlug || slugParts.includes("images")) {
        continue
      }

      // Get relative path from the current folder
      const relativeParts = slugParts.slice(folderParts.length)

      // Only process immediate children
      if (relativeParts.length === 0) continue

      // If it's a deeper path, track the immediate subfolder
      if (relativeParts.length > 1) {
        const immediateSubfolder = relativeParts[0]
        if (!processedPaths.has(immediateSubfolder)) {
          subfolders.add(immediateSubfolder)
          processedPaths.add(immediateSubfolder)
        }
        continue
      }

      // Process immediate files
      const filePath = relativeParts[0]
      // Skip if it's already processed, doesn't match file filter, or is an alias
      const isAlias = allFiles.some((f) =>
        f.aliases?.some(
          (alias) =>
            simplifySlug(alias) ===
            stripSlashes(simplifySlug(joinSegments(folderSlug, filePath) as FullSlug)),
        ),
      )

      let entrySlug: string | undefined = undefined

      if (!processedPaths.has(filePath) && shouldIncludeFile(filePath) && !isAlias) {
        processedPaths.add(filePath)
        const ext = path.extname(filePath)
        const baseFileName = path.basename(filePath, ext)
        if (ext.includes("pdf")) {
          // we will resolve this manually
          // url.resolve is considered legacy
          // WHATWG equivalent https://nodejs.dev/en/api/v18/url/#urlresolvefrom-to
          const url = new URL(`/${slug}`, "https://base.com")
          const canonicalDest = url.pathname
          let [destCanonical, _destAnchor] = splitAnchor(canonicalDest)
          entrySlug = decodeURIComponent(stripSlashes(destCanonical, true))
        }

        // Find all associated files with the same base name
        const associatedFiles = allFiles.filter((f) => {
          const fileSlug = stripSlashes(simplifySlug(f.slug!))
          const fileBase = path.basename(fileSlug, path.extname(fileSlug))
          const fileInFolder = fileSlug.startsWith(folderSlug)
          return fileInFolder && fileBase === baseFileName
        })

        // Sort associated files to get the most recent dates
        const sortedFiles = associatedFiles.sort(byDateAndAlphabetical(cfg))
        const defaultDate = { created: new Date(0), modified: new Date(0), published: new Date(0) }
        const dates =
          sortedFiles.length > 0
            ? sortedFiles[0].dates || fileData.dates || defaultDate
            : fileData.dates || defaultDate

        entries.push({
          slug: ext.includes("pdf")
            ? (`/${entrySlug ?? "index"}` as FullSlug)
            : (joinSegments(folderSlug, filePath) as FullSlug),
          frontmatter: {
            title: baseFileName,
            tags: [ext.split(".").at(-1) as string],
            pageLayout: "default",
          },
          dates,
        })
      }
    }

    // Add subfolders as entries
    for (const subfolder of subfolders) {
      const subfolderSlug = joinSegments(folderSlug, subfolder)

      // Find any markdown file that represents this folder
      const folderIndex = allFiles.find((f) => {
        const fileSlug = stripSlashes(simplifySlug(f.slug!))
        return fileSlug === subfolderSlug
      })

      // Get all files within this subfolder to determine its dates
      const filesInSubfolder = allFiles.filter((file) => {
        const fileSlug = stripSlashes(simplifySlug(file.slug!))
        return fileSlug.startsWith(subfolderSlug) && fileSlug !== subfolderSlug
      })

      // Sort files by date and take the first one's dates
      const subfolderDates =
        filesInSubfolder.length > 0
          ? filesInSubfolder.sort(byDateAndAlphabetical(cfg))[0].dates
          : (folderIndex?.dates ?? fileData?.dates)

      entries.push({
        slug: subfolderSlug as FullSlug,
        frontmatter: folderIndex?.frontmatter ?? {
          title: subfolder,
          tags: ["folder"],
          pageLayout: "default",
        },
        dates: subfolderDates,
      })
    }

    // Add any markdown-only entries that might not exist as files
    for (const file of allFiles) {
      const fileSlug = stripSlashes(simplifySlug(file.slug!))
      if (fileSlug.startsWith(folderSlug) && fileSlug !== folderSlug) {
        const relativePath = fileSlug.slice(folderSlug.length + 1)
        if (!relativePath.includes("/") && !processedPaths.has(relativePath)) {
          entries.push({
            slug: fileSlug as FullSlug,
            frontmatter: file.frontmatter,
            dates: file.dates,
          })
        }
      }
    }

    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = ["popover-hint", "notes-list", "side-col", ...cssClasses].join(" ")
    const content =
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)

    const listProps = {
      ...props,
      sort: options.sort,
      content,
      allFiles: entries,
      vaults: allFiles,
    }

    return (
      <>
        <section class={classes}>
          <h3 class="note-title">notes</h3>
          <PageList {...listProps} />
        </section>
        <aside class="notes-evergreen">
          <Evergreen {...listProps} />
        </aside>
      </>
    )
  }

  FolderContent.css = style + Evergreen.css
  FolderContent.afterDOMLoaded = Evergreen.afterDOMLoaded

  return FolderContent
}) satisfies QuartzComponentConstructor
