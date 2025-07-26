import { GlobalConfiguration, QuartzConfig } from "./quartz/cfg"
import { byDateAndAlphabetical } from "./quartz/components/PageList"
import * as Plugin from "./quartz/plugins"
import * as Component from "./quartz/components"
import { QuartzPluginData } from "./quartz/plugins/vfile"

const configuration: GlobalConfiguration = {
  pageTitle: "OpenTajdīd",
  enableSPA: true,
  enablePopovers: true,
  analytics: {
    provider: "plausible",
  },
  locale: "en-US",
  baseUrl: "superjet4663.github.io",
  ignorePatterns: [
    "private",
    // "Collections",
    // "MOCs",
    // "Misc",
    // "Definitions",
    // "People",
    // "Axis",
    // "Insights",
    // "bin",
    // "Incubating",
    "templates",
    ".obsidian",
    "**.adoc",
    "**.zip",
    "**.epub",
    "**.docx",
    "**.lvbitx",
    "**.slx",
    "**.so",
    "**/*400232791*",
    "__pycache__",
    ".mypy_cache",
    ".ruff_cache",
    "**.ignore.pdf",
    "capstone",
    "**/.conform*",
  ],
  defaultDateType: "created",
  theme: {
    cdnCaching: true,
    fontOrigin: "local",
    typography: {
      header: "Parclo Serif",
      body: "Parclo Serif",
      code: "Berkeley Mono",
    },
    colors: {
      lightMode: {
        light: "#fdf4cd",           // Warmer light bg
        lightgray: "#f4e8ba",       // Warm light bg1
        gray: "#8f7a66",            // Warmer gray
        darkgray: "#6f5f52",        // Warm dark gray
        dark: "#2f1b14",            // Dark warm brown
        secondary: "#d65d0e",       // Gruvbox orange
        tertiary: "#cc241d",        // Gruvbox red
        highlight: "rgba(214, 93, 14, 0.15)",
        textHighlight: "rgba(204, 36, 29, 0.25)",
      },
      darkMode: {
        light: "#1d2021",           // Gruvbox hard dark
        lightgray: "#32302f",       // Gruvbox dark bg2
        gray: "#928374",            // Gruvbox gray
        darkgray: "#bdae93",        // Gruvbox light gray
        dark: "#f9f5d7",            // Gruvbox light fg1
        secondary: "#fe8019",       // Gruvbox orange bright
        tertiary: "#83a598",        // Gruvbox blue bright
        highlight: "rgba(254, 128, 25, 0.15)",
        textHighlight: "rgba(131, 165, 152, 0.25)",
      },
    },
  },
}

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration,
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({ priority: ["frontmatter", "filesystem"] }),
      // Plugin.Aarnphm(),
      // Plugin.Pseudocode(),
      // Plugin.TikzJax(),
      Plugin.TelescopicText(),
      // FIXME: implement this
      // Plugin.Recipe(),
      // Plugin.Embeddings(),
      Plugin.Twitter(),
      // Plugin.SyntaxHighlighting({
      //   theme: {
      //     light: "rose-pine-dawn",
      //     dark: "rose-pine",
      //   },
      //   keepBackground: true,
      // }),
      // Plugin.Citations({ bibliography: "./content/References.bib" }),
      Plugin.ObsidianFlavoredMarkdown({ parseTags: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.CrawlLinks({
        markdownLinkResolution: "shortest",
        externalLinkIcon: true,
        lazyLoad: false,
        enableArxivEmbed: true,
        enableRawEmbed: true,
      }),
      // Plugin.Description(),
      // Plugin.Latex({
      //   renderEngine: "katex",
      //   customMacros: {
      //     "\\argmin": "\\mathop{\\operatorname{arg\\,min}}\\limits",
      //     "\\argmax": "\\mathop{\\operatorname{arg\\,max}}\\limits",
      //     "\\upgamma": "\\mathit{\\gamma}",
      //     "\\upphi": "\\mathit{\\phi}",
      //     "\\upbeta": "\\mathit{\\beta}",
      //     "\\upalpha": "\\mathit{\\alpha}",
      //     "\\uptheta": "\\mathit{\\theta}",
      //   },
      //   katexOptions: { strict: false },
      // }),
      Plugin.GitHub({
        internalLinks: [
          "superjet4663.github.io",
          "obsidian.md",
        ],
      }),
      // Plugin.GoogleDocs(),
      Plugin.TableOfContents({ maxDepth: 5 }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      // Plugin.LLM(),
      Plugin.FolderPage({
        pageBody: Component.FolderContent({
          sort: (a: QuartzPluginData, b: QuartzPluginData): number => {
            // Check if either file has a folder tag
            const aHasFolder = a.frontmatter?.tags?.includes("folder") ?? false
            const bHasFolder = b.frontmatter?.tags?.includes("folder") ?? false

            // If one has folder tag and other doesn't, prioritize the one with folder tag
            if (aHasFolder && !bHasFolder) return -1
            else if (!aHasFolder && bHasFolder) return 1
            else return byDateAndAlphabetical(configuration)(a, b)
          },
          include: [
            ".pdf",
            ".py",
            ".go",
            ".c",
            ".m",
            ".cu",
            ".java",
            ".sql",
            ".js",
            ".ipynb",
            ".json",
          ],
          exclude: [/\.(ignore\.pdf)$/, /400232791/],
        }),
      }),
      Plugin.TagPage(),
      // Plugin.ArenaPage(),
      // Plugin.InfinitePoemPage(),
      // Plugin.NotebookViewer(),
      Plugin.ContentIndex({ enableAtom: false }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Plugin.CustomOgImages(),
      // Plugin.PressKit(),
    ],
  },
}

export default config
