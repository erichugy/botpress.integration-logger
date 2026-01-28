import type { actions } from "@botpress/runtime"
import type { Origin } from "../types"

export type PlatformConfig = {
  origin: Origin
  name: string
  getTools: () => ReturnType<typeof actions.parseRelativeDate.asTool>[]
  mentionFormat: (userId: string) => string
  mentionInstructions: string
  userLookupInstructions: string
}
