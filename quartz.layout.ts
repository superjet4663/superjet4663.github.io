import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.StackedNotes(),
    Component.Breadcrumbs({
      rootName: "~",
      spacerSymbol: "/",
      showCurrentPage: true,
    }),
    Component.Image(),
    Component.Graph(),
    Component.Palette(),
    Component.Keybind(),
    Component.Search(),
    ],
  afterBody: [Component.Recommendations(), Component.Backlinks(), Component.Darkmode(), Component.FloatingButtons({position: 'right'}),
],
  footer: Component.Footer({
    layout: "minimal",
    links: {
      github: "https://github.com/superjet4663",
      twitter: "https://twitter.com/",
      bsky: "https://bsky.app/",
      feed: "/feed.xml",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Byline(Component.TagList(), 
    Component.ContentMeta()),
    Component.Darkmode(),
  ],
  sidebar: [
    Component.DesktopOnly(Component.TableOfContents()), 
    Component.Reader(),
    Component.FloatingButtons({position: 'right'}),
],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.StackedNotes(),
    Component.Darkmode(),
    Component.Breadcrumbs({ rootName: "~", spacerSymbol: "/", showCurrentPage: true,
 }),
    Component.Image(),
    Component.Graph(),
    Component.Palette(),
    Component.Keybind(),
    Component.Search(),
    Component.FloatingButtons({position: 'right'}),
  ],
  sidebar: [

    ],
}
