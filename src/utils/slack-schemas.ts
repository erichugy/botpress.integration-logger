import { z } from "@botpress/runtime"

// NOTE: Zod schemas kept private to avoid non-portable type inference errors
// when exporting. Types are inferred from schemas per convention.

const SlackMessageTagsSchema = z.object({
  "slack:ts": z.string(),
  "slack:userId": z.string(),
  "slack:channelId": z.string(),
  "slack:forkedToThread": z.string().optional(),
})

// NOTE: Slack mentions can be strings (user IDs) or objects depending on message source
const SlackMentionSchema = z.union([
  z.string(),
  z.object({
    type: z.string().optional(),
    user_id: z.string().optional(),
    text: z.string().optional(),
  }).passthrough(),
])

const SlackMessageSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  conversationId: z.string(),
  userId: z.string(),
  type: z.literal("text"),
  direction: z.literal("incoming"),
  payload: z.object({
    text: z.string(),
    mentions: z.array(SlackMentionSchema),
  }),
  tags: SlackMessageTagsSchema,
})

const SlackUserTagsSchema = z.object({
  "slack:id": z.string(),
})

const SlackUserSchema = z.object({
  id: z.string(),
  state: z.record(z.string()),
  tags: SlackUserTagsSchema,
})

const SlackConversationTagsSchema = z.object({
  "slack:id": z.string(),
  "slack:thread": z.string(),
  "slack:isBotReplyThread": z.string().optional(),
})

const SlackConversationDataSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  channel: z.string(),
  integration: z.literal("slack"),
  tags: SlackConversationTagsSchema,
})

const SlackConversationSchema = z.object({
  id: z.string(),
  channel: z.literal("slack.thread"),
  integration: z.literal("slack"),
  alias: z.literal("slack"),
  conversation: SlackConversationDataSchema,
})

export type SlackMessageTags = z.infer<typeof SlackMessageTagsSchema>
export type SlackMessage = z.infer<typeof SlackMessageSchema>
export type SlackUserTags = z.infer<typeof SlackUserTagsSchema>
export type SlackUser = z.infer<typeof SlackUserSchema>
export type SlackConversationTags = z.infer<typeof SlackConversationTagsSchema>
export type SlackConversationData = z.infer<typeof SlackConversationDataSchema>
export type SlackConversation = z.infer<typeof SlackConversationSchema>

export function getSlackUserId(message: SlackMessage, user: SlackUser): string {
  return message.tags["slack:userId"] ?? user.tags["slack:id"]
}

export function isBotReplyThread(conversation: SlackConversation): boolean {
  return conversation.conversation.tags["slack:isBotReplyThread"] === "true"
}

type MessageLike = { type?: string | number | symbol }

export function isSlackMessage(message: MessageLike): message is SlackMessage {
  return SlackMessageSchema.safeParse(message).success
}

export function parseSlackMessage(message: MessageLike): SlackMessage | null {
  const result = SlackMessageSchema.safeParse(message)
  return result.success ? result.data : null
}
