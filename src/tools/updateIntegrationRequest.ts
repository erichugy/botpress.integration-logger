import { Autonomous, z } from "@botpress/runtime"
import { IntegrationRequestsTable } from "../tables/IntegrationRequestsTable"

const statusEnum = z.enum(["new", "on_hold", "in_progress", "completed", "rejected"])
const priorityEnum = z.enum(["low", "medium", "high", "critical"])

export const updateIntegrationRequest = new Autonomous.Tool({
  name: "updateIntegrationRequest",
  description:
    "Update an existing integration request by ID. Can update status, priority, due date, contact person, or CC list. Cannot update core identity fields (title, description, requestedBy, origin, endUser).",

  input: z.object({
    requestId: z
      .number()
      .describe("The ID of the integration request to update"),
    status: statusEnum
      .optional()
      .describe("New status for the request"),
    priority: priorityEnum
      .optional()
      .describe("New priority level"),
    dueDate: z
      .string()
      .optional()
      .describe("New due date in ISO format (YYYY-MM-DD)"),
    contactPersonName: z
      .string()
      .optional()
      .describe("New contact person name"),
    contactPersonEmail: z
      .string()
      .email()
      .optional()
      .describe("New contact person email"),
    ccList: z
      .array(z.string().email())
      .optional()
      .describe("Updated CC list (replaces existing list)"),
  }),

  output: z.object({
    success: z.boolean(),
    updatedFields: z.array(z.string()),
    message: z.string(),
    request: z
      .object({
        id: z.number(),
        title: z.string(),
        status: statusEnum,
        priority: priorityEnum,
        requestedByName: z.string(),
        dueDate: z.string().optional(),
      })
      .optional(),
  }),

  handler: async ({
    requestId,
    status,
    priority,
    dueDate,
    contactPersonName,
    contactPersonEmail,
    ccList,
  }) => {
    // First, verify the request exists
    const existing = await IntegrationRequestsTable.findRows({
      filter: { id: requestId },
      limit: 1,
    })

    if (existing.rows.length === 0) {
      return {
        success: false,
        updatedFields: [],
        message: `Request #${requestId} not found.`,
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {}
    const updatedFields: string[] = []

    if (status !== undefined) {
      updates.status = status
      updatedFields.push("status")
    }
    if (priority !== undefined) {
      updates.priority = priority
      updatedFields.push("priority")
    }
    if (dueDate !== undefined) {
      updates.dueDate = dueDate
      updatedFields.push("dueDate")
    }
    if (contactPersonName !== undefined) {
      updates.contactPersonName = contactPersonName
      updatedFields.push("contactPersonName")
    }
    if (contactPersonEmail !== undefined) {
      updates.contactPersonEmail = contactPersonEmail
      updatedFields.push("contactPersonEmail")
    }
    if (ccList !== undefined) {
      updates.ccList = ccList
      updatedFields.push("ccList")
    }

    if (updatedFields.length === 0) {
      return {
        success: false,
        updatedFields: [],
        message: "No fields provided to update.",
      }
    }

    // Perform the update
    await IntegrationRequestsTable.updateRows({
      rows: [{ id: requestId, ...updates }],
    })

    // Fetch updated row
    const updated = await IntegrationRequestsTable.findRows({
      filter: { id: requestId },
      limit: 1,
    })

    const row = updated.rows[0]

    return {
      success: true,
      updatedFields,
      message: `Request #${requestId} updated: ${updatedFields.join(", ")}.`,
      request: row
        ? {
            id: row.id,
            title: row.title,
            status: row.status,
            priority: row.priority,
            requestedByName: row.requestedByName,
            dueDate: row.dueDate,
          }
        : undefined,
    }
  },
})

export default updateIntegrationRequest
