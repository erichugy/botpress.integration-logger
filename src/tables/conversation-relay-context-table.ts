import { Table, z } from "@botpress/runtime"

export const ConversationRelayContextTable = new Table({
  name: "ConversationRelayContextTable",
  description: "Stores relay context to inject into target Slack conversations",
  columns: {
    relayId: z.string().describe("Unique relay identifier referenced by conversation tags"),
    targetConversationId: z.string().describe("Conversation ID that will consume this relay context"),
    sourceConversationId: z.string().describe("Conversation ID where relay was initiated"),
    sourceChannelOrigin: z.enum(["channel", "dm", "thread"]).optional().describe("Channel origin of the source conversation message"),
    createdBySlackUserId: z.string().describe("Slack user ID of the relay initiator"),
    contextSummary: { schema: z.string().describe("Short summary of why this relay was created"), searchable: true },
    contextPayload: z.string().describe("JSON payload containing full supplementary context"),
    consumed: z.boolean().default(false).describe("Whether this relay context has been consumed"),
    consumedAt: z.string().optional().describe("ISO timestamp when relay context was consumed"),
    expiresAt: z.string().optional().describe("Optional ISO timestamp after which relay should not be used"),
    status: z
      .enum(["pending", "awaiting_response", "responded", "consumed", "expired"])
      .default("pending")
      .describe("Current status of the relay context lifecycle"),
    question: { schema: z.string().optional().describe("The specific question being asked of the target user"), searchable: true },
    responsePayload: z.string().optional().describe("JSON payload containing the target user's response"),
    respondedAt: z.string().optional().describe("ISO timestamp when target user responded"),
    respondedBySlackUserId: z.string().optional().describe("Slack user ID of the person who responded"),
  },
})
