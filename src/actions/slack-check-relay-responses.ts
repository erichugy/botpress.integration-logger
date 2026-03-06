import { Action, context, z } from "@botpress/runtime"
import { ConversationRelayContextTable } from "../tables/conversation-relay-context-table"

const inputSchema = z.object({
  sourceConversationId: z.string().trim().min(1).max(500).describe("The source conversation ID to check for relay responses"),
})

const responseItemSchema = z.object({
  relayId: z.string().describe("The relay ID of this response"),
  question: z.string().optional().describe("The original question that was asked"),
  contextSummary: z.string().describe("Summary of the relay context"),
  responseText: z.string().describe("The target user's response text"),
  respondedBySlackUserId: z.string().optional().describe("Slack user ID of the person who responded"),
  respondedAt: z.string().optional().describe("ISO timestamp when the response was submitted"),
})

const outputSchema = z.object({
  responses: z.array(responseItemSchema).describe("Array of relay responses that have been answered"),
  count: z.number().describe("Number of responses returned"),
})

type Output = z.infer<typeof outputSchema>

function parseResponseText(responsePayload: string | undefined): string {
  if (!responsePayload) {
    return ""
  }

  try {
    const parsed = JSON.parse(responsePayload)
    return String(parsed.text || "")
  } catch {
    return responsePayload
  }
}

const slackCheckRelayResponses = new Action({
  name: "slackCheckRelayResponses",
  description:
    "Check if any pending relays for a source conversation have been answered. Returns responded relays and marks them as consumed.",
  input: inputSchema,
  output: outputSchema,

  async handler({ input }): Promise<Output> {
    const logger = context.get("logger")

    const { rows } = await ConversationRelayContextTable.findRows({
      filter: {
        sourceConversationId: input.sourceConversationId,
        status: "responded",
      },
    })

    if (!rows.length) {
      return { responses: [], count: 0 }
    }

    const responses = rows.map((row) => ({
      relayId: row.relayId,
      question: row.question || undefined,
      contextSummary: row.contextSummary,
      responseText: parseResponseText(row.responsePayload),
      respondedBySlackUserId: row.respondedBySlackUserId || undefined,
      respondedAt: row.respondedAt || undefined,
    }))

    const now = new Date().toISOString()

    try {
      await ConversationRelayContextTable.updateRows({
        rows: rows.map((row) => ({
          id: row.id,
          status: "consumed",
          consumed: true,
          consumedAt: now,
        })),
      })
    } catch (error) {
      // If marking as consumed fails, return empty to avoid duplicate consumption on retry
      logger.error("slackCheckRelayResponses: failed to mark rows as consumed", {
        sourceConversationId: input.sourceConversationId,
        relayIds: rows.map((r) => r.relayId),
        error: error instanceof Error ? error.message : String(error),
      })
      return { responses: [], count: 0 }
    }

    logger.debug("slackCheckRelayResponses: consumed relay responses", {
      sourceConversationId: input.sourceConversationId,
      count: responses.length,
      relayIds: responses.map((r) => r.relayId),
    })

    return {
      responses,
      count: responses.length,
    }
  },
})

export default slackCheckRelayResponses
