import type { Origin } from "../types"

import { SLACK_TAG_KEYS } from "./slack/tags"

type PlatformTagKeys = {
  userId: string
  messageUserId: string
  isBotReplyThread: string
}

const TAG_KEYS: Record<Origin, PlatformTagKeys> = {
  slack: SLACK_TAG_KEYS,
}

type TagSource = { tags: Record<string, string | undefined> }

/** Get platform user ID from user tags */
export function getUserId(origin: Origin, user: TagSource): string | undefined {
  return user.tags[TAG_KEYS[origin].userId]
}

/** Get sender ID from message tags */
export function getMessageUserId(
  origin: Origin,
  message: TagSource
): string | undefined {
  return message.tags[TAG_KEYS[origin].messageUserId]
}

/** Check if conversation is a bot reply thread */
export function isBotReplyThread(
  origin: Origin,
  conversation: TagSource
): boolean {
  return conversation.tags[TAG_KEYS[origin].isBotReplyThread] === "true"
}
