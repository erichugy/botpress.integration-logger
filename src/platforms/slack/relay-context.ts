import { ConversationRelayContextTable } from "../../tables/conversation-relay-context-table"
import type { ChannelOrigin } from "../../types"

type ConversationTags = Record<string, string | undefined>

type ConversationLike = {
  tags: ConversationTags
}

type PendingRelayContext = {
  rowId: number
  relayId: string
  summary: string
  payload: unknown
  sourceConversationId: string
  sourceChannelOrigin: ChannelOrigin | undefined
  question?: string
}

type RelayResponseResult = {
  relayId: string
  question?: string
  contextSummary: string
  responseText: string
  respondedBySlackUserId?: string
  respondedAt?: string
}

export async function loadPendingRelayContext(tags: ConversationTags): Promise<PendingRelayContext | undefined> {
  const relayContextId = tags.relayContextId
  const relayPending = tags.relayContextPending === "true"

  if (!relayContextId || !relayPending) {
    return undefined
  }

  const result = await ConversationRelayContextTable.findRows({
    filter: {
      relayId: relayContextId,
      consumed: false,
    },
    limit: 1,
  })

  const row = result.rows[0]
  if (!row) {
    return undefined
  }

  let parsedPayload: unknown = row.contextPayload
  try {
    parsedPayload = JSON.parse(row.contextPayload)
  } catch {
    parsedPayload = row.contextPayload
  }

  return {
    rowId: row.id,
    relayId: row.relayId,
    summary: row.contextSummary,
    payload: parsedPayload,
    sourceConversationId: row.sourceConversationId,
    sourceChannelOrigin: row.sourceChannelOrigin,
    question: row.question ?? undefined,
  }
}

export async function markRelayContextConsumed(conversation: ConversationLike, rowId: number): Promise<void> {
  await ConversationRelayContextTable.updateRows({
    rows: [
      {
        id: rowId,
        consumed: true,
        consumedAt: new Date().toISOString(),
      },
    ],
  })

  conversation.tags.relayContextPending = "false"
}

export async function loadPendingRelayResponses(conversationId: string): Promise<RelayResponseResult[]> {
  const result = await ConversationRelayContextTable.findRows({
    filter: {
      sourceConversationId: conversationId,
      status: "responded",
    },
    limit: 50,
  })

  return result.rows.map((row) => {
    let responseText = ""
    if (row.responsePayload) {
      try {
        const parsed = JSON.parse(row.responsePayload)
        responseText = typeof parsed === "string" ? parsed : (parsed.text ?? JSON.stringify(parsed))
      } catch {
        responseText = row.responsePayload
      }
    }

    return {
      relayId: row.relayId,
      question: row.question ?? undefined,
      contextSummary: row.contextSummary,
      responseText,
      respondedBySlackUserId: row.respondedBySlackUserId ?? undefined,
      respondedAt: row.respondedAt ?? undefined,
    }
  })
}
