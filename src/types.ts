export type PriorityLevel = "low" | "medium" | "high" | "critical"

export type PendingRequest = {
  requestedByName?: string
  requestedByEmail?: string
  title?: string
  description?: string
  priority?: PriorityLevel
  endUser?: string
  dueDate?: string
  contactPersonInput?: string
  contactPersonEmail?: string
}

export type Origin = "slack" // NOTE: Only Slack is supported for now

export type ChannelOrigin = "channel" | "dm" | "thread"

export type RelayContext = {
  relayId: string
  summary: string
  payload: unknown
  sourceConversationId: string
  sourceChannelOrigin?: ChannelOrigin
}

export type InstructionContext = {
  userId: string
  userName?: string
  userEmail?: string
  pendingRequest?: PendingRequest
  isPublicChannel: boolean
  origin: Origin
  channelOrigin?: ChannelOrigin
  relayContext?: RelayContext
}
