import type { actions } from "@botpress/runtime"

import type { Origin } from "../types"

export type MessageFormatter = {
  bold: (text: string) => string
  code: (text: string) => string
  bullet: (text: string) => string
}

export type PlatformConfig = {
  origin: Origin
  name: string
  getTools: () => ReturnType<typeof actions.parseRelativeDate.asTool>[]
  mentionFormat: (userId: string) => string
  mentionInstructions: string
  userLookupInstructions: string
}
