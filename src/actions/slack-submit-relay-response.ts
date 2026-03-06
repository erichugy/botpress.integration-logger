import { Action, context, z } from "@botpress/runtime"
import { RuntimeError } from "@botpress/sdk"
import { ConversationRelayContextTable } from "../tables/conversation-relay-context-table"

const inputSchema = z.object({
  relayId: z.string().trim().min(1).max(500).describe("The relay ID to respond to"),
  responseText: z.string().trim().min(1).max(5000).describe("The target user's response text"),
  respondedBySlackUserId: z.string().max(100).optional().describe("Slack user ID of the person who responded"),
})

const outputSchema = z.object({
  success: z.boolean().describe("Whether the response was successfully submitted"),
  relayId: z.string().describe("The relay ID that was responded to"),
  sourceConversationId: z.string().describe("The source conversation ID to notify"),
  message: z.string().describe("Human-readable result message"),
})

type Output = z.infer<typeof outputSchema>

const slackSubmitRelayResponse = new Action({
  name: "slackSubmitRelayResponse",
  description:
    "Submit a response to a relay question. Called by the DM conversation agent when the target user provides an answer.",
  input: inputSchema,
  output: outputSchema,

  async handler({ input }): Promise<Output> {
    const logger = context.get("logger")

    const { rows } = await ConversationRelayContextTable.findRows({
      filter: { relayId: input.relayId },
      limit: 1,
    })

    if (!rows.length) {
      throw new RuntimeError(`Relay "${input.relayId}" not found. It may have been deleted or never existed.`)
    }

    const row = rows[0]

    if (row.status !== "awaiting_response") {
      const statusMessages: Record<string, string> = {
        pending: "has not been sent to a target user yet",
        responded: "has already been responded to",
        consumed: "has already been consumed by the source conversation",
        expired: "has expired and can no longer receive responses",
      }

      const reason = statusMessages[row.status] || `has unexpected status "${row.status}"`
      throw new RuntimeError(`Relay "${input.relayId}" ${reason}. Only relays with status "awaiting_response" can receive responses.`)
    }

    const now = new Date().toISOString()

    try {
      await ConversationRelayContextTable.updateRows({
        rows: [
          {
            id: row.id,
            status: "responded",
            responsePayload: JSON.stringify({ text: input.responseText }),
            respondedAt: now,
            respondedBySlackUserId: input.respondedBySlackUserId || undefined,
          },
        ],
      })
    } catch (error) {
      logger.error("slackSubmitRelayResponse: failed to update relay row", {
        relayId: input.relayId,
        rowId: row.id,
        error: error instanceof Error ? error.message : String(error),
      })
      throw new RuntimeError(`Failed to record response for relay "${input.relayId}". Please try again.`)
    }

    logger.debug("slackSubmitRelayResponse: response recorded", {
      relayId: input.relayId,
      sourceConversationId: row.sourceConversationId,
      respondedBySlackUserId: input.respondedBySlackUserId,
    })

    return {
      success: true,
      relayId: input.relayId,
      sourceConversationId: row.sourceConversationId,
      message: `Response submitted for relay "${input.relayId}". Source conversation ${row.sourceConversationId} can now retrieve it.`,
    }
  },
})

export default slackSubmitRelayResponse
