import matter from "gray-matter"
import remarkFrontmatter from "remark-frontmatter"
import { QuartzTransformerPlugin } from "../types"
import yaml from "js-yaml"
import { FilePath, FullSlug, slugifyFilePath, slugTag, getFileExtension } from "../../util/path"
import { QuartzPluginData } from "../vfile"
import { i18n } from "../../i18n"
import { ContentLayout } from "../emitters/contentIndex"

function getAliasSlugs(aliases: string[]): FullSlug[] {
  const res: FullSlug[] = []
  for (const alias of aliases) {
    const isMd = getFileExtension(alias) === "md"
    const mockFp = isMd ? alias : alias + ".md"
    const slug = slugifyFilePath(mockFp as FilePath)
    res.push(slug)
  }
  return res
}

function coalesceAliases(data: { [key: string]: any }, aliases: string[]) {
  for (const alias of aliases) {
    if (data[alias] !== undefined && data[alias] !== null) return data[alias]
  }
}

function coerceToArray(input: string | string[]): string[] | undefined {
  if (input === undefined || input === null) return undefined

  // coerce to array
  if (!Array.isArray(input)) {
    input = input
      .toString()
      .split(",")
      .map((tag: string) => tag.trim())
  }

  // remove all non-strings
  return input
    .filter((tag: unknown) => typeof tag === "string" || typeof tag === "number")
    .map((tag: string | number) => tag.toString())
}

export const FrontMatter: QuartzTransformerPlugin = () => ({
  name: "FrontMatter",
  markdownPlugins: ({ cfg, allSlugs }) => [
    [remarkFrontmatter, ["yaml", "toml"]],
    () => {
      return (_, file) => {
        const { data } = matter(Buffer.from(file.value), {
          delimiters: "---",
          language: "yaml",
          engines: {
            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
          },
        })

        if (data.title != null && data.title.toString() !== "") {
          data.title = data.title.toString()
        } else {
          data.title = file.stem ?? i18n(cfg.configuration.locale).propertyDefaults.title
        }

        const tags = coerceToArray(coalesceAliases(data, ["tags"]))
        if (tags) data.tags = [...new Set(tags.map((tag: string) => slugTag(tag)))]

        const aliases = coerceToArray(coalesceAliases(data, ["aliases", "alias"]))
        if (aliases) {
          data.aliases = aliases
          file.data.aliases = getAliasSlugs(aliases)
          allSlugs.push(...file.data.aliases)
        }

        if (data.permalink != null && data.permalink.toString() !== "") {
          data.permalink = data.permalink.toString() as FullSlug
          const aliases = file.data.aliases ?? []
          aliases.push(data.permalink)
          file.data.aliases = aliases
          allSlugs.push(data.permalink)
        }

        const cssclasses = coerceToArray(coalesceAliases(data, ["cssclasses"]))
        if (cssclasses) data.cssclasses = cssclasses

        const noindex = coerceToArray(coalesceAliases(data, ["noindex", "unlisted"]))
        if (noindex) data.noindex = noindex

        const socialImage = coalesceAliases(data, ["socialImage", "image", "cover"])
        if (socialImage) data.socialImage = socialImage

        const description = coalesceAliases(data, ["description", "socialDescription"])
        if (description) data.description = description

        const transclude = coalesceAliases(data, ["transclude", "transclusion"])
        if (transclude) data.transclude = transclude

        const socials = coalesceAliases(data, ["social", "socials"])
        if (socials) data.socials = socials

        const created = coalesceAliases(data, ["date", "created"])
        if (created) {
          data.created = created
          data.modified ||= created // if modified is not set, use created
        }
        const modified = coalesceAliases(data, ["lastmod", "updated", "last-modified", "modified"])
        if (modified) data.modified = modified
        const published = coalesceAliases(data, ["publishDate", "published", "date"])
        if (published) data.published = published

        let layout = coalesceAliases(data, ["pageLayout", "layout"])
        layout ||= "default"
        data.pageLayout = layout

        // fill in frontmatter
        file.data.frontmatter = data as QuartzPluginData["frontmatter"]
      }
    },
  ],
})

export type TranscludeOptions = {
  dynalist: boolean
  title: boolean
}

declare module "vfile" {
  interface DataMap {
    aliases: FullSlug[]
    frontmatter: { [key: string]: unknown } & {
      title: string
      pageLayout: ContentLayout
    } & Partial<{
        priority: number | undefined
        permalinks: string[]
        tags: string[]
        aliases: string[]
        abstract: string
        created: string
        modified: string
        published: string
        description: string
        publish: boolean
        draft: boolean
        lang: string
        enableToc: string
        cssclasses: string[]
        socialImage: string
        socialDescription: string
        noindex: boolean
        comments: boolean
        transclude: Partial<TranscludeOptions>
        signature: string
        socials: Record<string, string>
      }>
  }
}
