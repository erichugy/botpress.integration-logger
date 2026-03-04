import { Action, actions, context, z } from "@botpress/runtime"
import { RuntimeError } from "@botpress/sdk"
import { ConversationRelayContextTable } from "../tables/conversation-relay-context-table"

const SLACK_USER_ID_REGEX = /^U[A-Z0-9]+$/
const SLACK_MENTION_REGEX = /^<@([A-Z0-9]+)>$/

function normalizeSlackUserId(value: string): string {
  const mentionMatch = SLACK_MENTION_REGEX.exec(value.trim())
  return mentionMatch ? mentionMatch[1] : value.trim()
}

function assertValidSlackUserId(value: string, fieldName: string): string {
  const normalized = normalizeSlackUserId(value)
  if (!SLACK_USER_ID_REGEX.test(normalized)) {
    throw new RuntimeError(
      `${fieldName} must be a Slack user ID in the format Uxxxxxxxxxx (or <@Uxxxxxxxxxx>). Received "${value}". Botpress user IDs like "user_..." are not allowed.`
    )
  }
  return normalized
}

const slackRelayToConversation = new Action({
  name: "slackRelayToConversation",
  description:
    "Create or find a target Slack conversation, attach supplementary relay context to it, and mark that context as pending for the next turn.",

  input: z.object({
    targetType: z.enum(["dm", "channel"]).describe("Target conversation type"),
    targetSlackUserId: z.string().optional().describe("Required when targetType is 'dm'. Must be a Slack user ID starting with U (e.g., U0A6E7PA7FH), not a Botpress user ID."),
    targetChannelName: z.string().optional().describe("Required when targetType is 'channel'"),
    contextSummary: z.string().min(1).describe("Short summary of what context is being relayed"),
    contextPayload: z.unknown().optional().describe("Structured supplementary context payload"),
    sourceConversationId: z.string().optional().describe("Source conversation id (defaults to current conversation)"),
    sourceChannelOrigin: z.enum(["channel", "dm", "thread"]).optional().describe("Source channel origin for traceability"),
    createdBySlackUserId: z.string().optional().describe("Slack user ID who initiated the relay (must start with U)"),
    expiresAt: z.string().optional().describe("Optional ISO timestamp after which relay context should be ignored"),
    question: z.string().optional().describe("The specific question to ask the target user"),
  }),

  output: z.object({
    success: z.boolean(),
    relayId: z.string(),
    targetConversationId: z.string(),
    targetType: z.enum(["dm", "channel"]),
    message: z.string(),
  }),

  async handler({ input }) {
    const logger = context.get("logger")
    const client = context.get("client")
    const currentConversation = context.get("conversation")

    let targetConversationId = ""
    const createdBySlackUserId = input.createdBySlackUserId
      ? assertValidSlackUserId(input.createdBySlackUserId, "createdBySlackUserId")
      : undefined

    if (input.targetType === "dm") {
      if (!input.targetSlackUserId) {
        throw new Error("targetSlackUserId is required when targetType is 'dm'")
      }
      const targetSlackUserId = assertValidSlackUserId(input.targetSlackUserId, "targetSlackUserId")
      const result = await actions.slack.startDmConversation({ slackUserId: targetSlackUserId })
      targetConversationId = result.conversationId
    }

    if (input.targetType === "channel") {
      if (!input.targetChannelName) {
        throw new Error("targetChannelName is required when targetType is 'channel'")
      }
      const result = await actions.slack.startChannelConversation({ channelName: input.targetChannelName })
      targetConversationId = result.conversationId
    }

    const relayId = `relay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const sourceConversationId = input.sourceConversationId ?? currentConversation.id

    const rowResult = await ConversationRelayContextTable.createRows({
      rows: [{
        relayId,
        targetConversationId,
        sourceConversationId,
        sourceChannelOrigin: input.sourceChannelOrigin,
        createdBySlackUserId: createdBySlackUserId ?? "unknown",
        contextSummary: input.contextSummary,
        contextPayload: JSON.stringify(input.contextPayload ?? {}),
        consumed: false,
        consumedAt: undefined,
        expiresAt: input.expiresAt,
        status: "awaiting_response",
        question: input.question,
      }],
    })

    const targetConversation = await client.getConversation({ id: targetConversationId })
    await client.updateConversation({
      id: targetConversationId,
      tags: {
        ...targetConversation.conversation.tags,
        relayContextId: relayId,
        relayContextPending: "true",
        relaySourceConversationId: sourceConversationId,
        relayCreatedAt: new Date().toISOString(),
      },
    })

    logger.debug("slackRelayToConversation: attached relay context", {
      relayId, targetConversationId, sourceConversationId,
      targetType: input.targetType, createdRowId: rowResult.rows[0]?.id,
    })

    return {
      success: true,
      relayId,
      targetConversationId,
      targetType: input.targetType,
      message: `Relay context ${relayId} attached to conversation ${targetConversationId}.`,
    }
  },
})

export default slackRelayToConversation
