import { z } from "@botpress/runtime"
import { priorityLevelSchema } from "../../schemas/integration-request"

/**
 * Schema for a pending integration request being collected in conversation.
 * Shared across all Slack conversation handlers (channel, thread, dm).
 */
const pendingRequestSchema = z.object({
  requestedByName: z.string().optional(),
  requestedByEmail: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: priorityLevelSchema.optional(),
  endUser: z.string().optional(),
  dueDate: z.string().optional(),
  contactPersonInput: z.string().optional(),
  contactPersonEmail: z.string().optional(),
})

/**
 * Conversation state schema shared by all Slack handlers.
 */
export const conversationStateSchema = z.object({
  pendingRequest: pendingRequestSchema.optional(),
})
