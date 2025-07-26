import { ComponentType, JSX } from "preact"
import { StaticResources } from "../util/resources"
import { QuartzPluginData } from "../plugins/vfile"
import { GlobalConfiguration } from "../cfg"
import { Node } from "hast"
import { BuildCtx } from "../util/ctx"

export type QuartzComponentProps = {
  ctx: BuildCtx
  externalResources: StaticResources
  fileData: QuartzPluginData
  cfg: GlobalConfiguration
  children: (QuartzComponent | JSX.Element)[]
  tree: Node
  allFiles: QuartzPluginData[]
  displayClass?: "mobile-only" | "desktop-only"
} & JSX.IntrinsicAttributes & {
    [key: string]: any
  }

export type QuartzComponent = ComponentType<QuartzComponentProps> & {
  css?: string
  beforeDOMLoaded?: string
  afterDOMLoaded?: string
}

export type QuartzComponentConstructor<Options extends object | undefined = undefined> = (
  opts: Options,
) => QuartzComponent

interface Entity {
  id: number
  createdDate: string
  modifiedDate: string
}

interface Highlight extends Entity {
  userId: number
  linkId: number
  highlight: string
  leftContext: string
  rightContext: string
  rawHighlight: string
  comment_ids: string[]
  comment: string
}

interface Topic extends Entity {
  userId: number
  topic: string
  slug: string
  public: boolean
}

interface FollowingUser {
  id: number
  firstName: string
  lastName: string
  userLink: string
  lastOnline: string
}

export interface Trail {
  id: number
  trailName: string
  ownerId: number
  description?: string
  colorHex: string
  emojiUnicode: string
  flipped: any
  hash: string
  slug: string
  createdDate: string
}

export interface TrailInfo {
  trail: Trail
  links: Map<number, Link>
}

export interface User extends Entity {
  firstName: string
  lastName: string
  major?: string
  interests?: string
  expertise?: string
  school: string
  github?: string
  twitter: string
  website: string
  lastOnline: string
  lastCheckedNotifications: string
  views: number
  numFollowers: number
  followed?: boolean
  followingMe?: boolean
  recentUsers: any[]
  followingUsers: FollowingUser[]
}

export interface Link extends Entity {
  link: string
  title: string
  favorite: boolean
  snippet: string
  toRead: boolean
  createdBy: number
  metadata?: {
    full_text: string
    author: string
    page_type: string
  }
  lastCrawled: any
  trails: Trail[]
  comments: string[]
  mentions: string[]
  topics: Topic[]
  highlights: Highlight[]
  userIds?: number[]
}

export interface Following {
  link: Link
  user: FollowingUser
}

export interface CuriusResponse {
  links?: Link[]
  user?: User
  following?: Following[]
}
