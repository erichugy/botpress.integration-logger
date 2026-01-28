import type { Origin } from "../types"

import { slackConfig } from "./slack"
import type { PlatformConfig } from "./types"

const platformConfigs: Record<Origin, PlatformConfig> = {
  slack: slackConfig,
}

export function getPlatformConfig(origin: Origin): PlatformConfig {
  return platformConfigs[origin]
}

export { getMessageUserId, getUserId, isBotReplyThread } from "./identity"
export type { MessageFormatter, PlatformConfig } from "./types"
