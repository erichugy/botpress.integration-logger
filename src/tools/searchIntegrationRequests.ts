import { Autonomous, z } from "@botpress/runtime"
import { IntegrationRequestsTable } from "../tables/IntegrationRequestsTable"

const statusEnum = z.enum(["new", "on_hold", "in_progress", "completed", "rejected"])
const priorityEnum = z.enum(["low", "medium", "high", "critical"])

export const searchIntegrationRequests = new Autonomous.Tool({
  name: "searchIntegrationRequests",
  description:
    "Search and filter existing integration requests. Use this to find requests by keyword, status, priority, or requester.",

  input: z.object({
    query: z
      .string()
      .optional()
      .describe("Semantic search on title and description"),
    status: statusEnum
      .optional()
      .describe("Filter by request status"),
    priority: priorityEnum
      .optional()
      .describe("Filter by priority level"),
    requestedBy: z
      .string()
      .optional()
      .describe("Filter by requester's Slack user ID"),
    limit: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe("Maximum number of results to return (1-10, default 5)"),
  }),

  output: z.object({
    success: z.boolean(),
    count: z.number(),
    requests: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        status: statusEnum,
        priority: priorityEnum,
        requestedByName: z.string(),
        dueDate: z.string().optional(),
        createdAt: z.string(),
      })
    ),
    message: z.string(),
  }),

  handler: async ({ query, status, priority, requestedBy, limit }) => {
    const filter: Record<string, unknown> = {}

    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (requestedBy) filter.requestedBy = requestedBy

    const result = await IntegrationRequestsTable.findRows({
      search: query,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit: limit ?? 5,
    })

    const requests = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      priority: row.priority,
      requestedByName: row.requestedByName,
      dueDate: row.dueDate,
      createdAt: row.createdAt,
    }))

    const filterParts: string[] = []
    if (query) filterParts.push(`matching "${query}"`)
    if (status) filterParts.push(`status: ${status}`)
    if (priority) filterParts.push(`priority: ${priority}`)
    if (requestedBy) filterParts.push(`by user ${requestedBy}`)

    const filterDesc = filterParts.length > 0 ? ` (${filterParts.join(", ")})` : ""

    return {
      success: true,
      count: requests.length,
      requests,
      message:
        requests.length > 0
          ? `Found ${requests.length} request(s)${filterDesc}.`
          : `No requests found${filterDesc}.`,
    }
  },
})

export default searchIntegrationRequests
