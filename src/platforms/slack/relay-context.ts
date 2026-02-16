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
