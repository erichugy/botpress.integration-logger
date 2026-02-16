import { z } from "@botpress/runtime"

export const PRIORITY_LEVELS = ["low", "medium", "high", "critical"] as const
export const INTEGRATION_REQUEST_STATUSES = [
  "new",
  "on_hold",
  "in_progress",
  "completed",
  "rejected",
] as const

export const priorityLevelSchema = z.enum(PRIORITY_LEVELS)
export const integrationRequestStatusSchema = z.enum(INTEGRATION_REQUEST_STATUSES)

export type PriorityLevel = z.infer<typeof priorityLevelSchema>
export type IntegrationRequestStatus = z.infer<typeof integrationRequestStatusSchema>
