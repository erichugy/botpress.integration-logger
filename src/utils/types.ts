export type PriorityLevel = "low" | "medium" | "high" | "critical"

export type PendingRequest = {
  requestedByName?: string
  requestedByEmail?: string
  title?: string
  description?: string
  priority?: PriorityLevel
  endUser?: string
  dueDate?: string
  contactPerson?: string
  contactPersonEmail?: string
}

export type InstructionContext = {
  userId: string
  userName?: string
  pendingRequest?: PendingRequest
  isPublicChannel: boolean
}
