export type PriorityLevel = "low" | "medium" | "high" | "critical"

export type PendingRequest = {
  title?: string
  description?: string
  priority?: PriorityLevel
}

export type InstructionContext = {
  userId: string
  pendingRequest?: PendingRequest
  isPublicChannel: boolean
}
