/** Slack-specific system tag keys (set by the Slack integration) */
export const SLACK_TAG_KEYS = {
  userId: "slack:id",
  messageUserId: "slack:userId",
  isBotReplyThread: "slack:isBotReplyThread",
} as const
