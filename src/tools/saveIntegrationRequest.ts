import { Autonomous, z, user, bot } from "@botpress/runtime"
import { IntegrationRequestsTable } from "../tables/IntegrationRequestsTable"

export const saveIntegrationRequest: Autonomous.Tool = new Autonomous.Tool({
  name: "saveIntegrationRequest",
  description:
    "Save a new integration request to the database. Call this tool once you have gathered ALL required information from the user.",

  input: z.object({
    title: z
      .string()
      .min(3)
      .max(200)
      .describe("Brief, descriptive title for the integration request"),
    description: z
      .string()
      .min(10)
      .max(2000)
      .describe("Detailed description of what the integration should do"),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .describe("Priority level: low (nice-to-have), medium (useful), high (important), critical (urgent)"),
    requestedByName: z
      .string()
      .describe("Name of the person making this request"),
    requestedByEmail: z
      .string()
      .email()
      .optional()
      .describe("Email of the person making this request (if provided)"),
    endUser: z
      .string()
      .describe("Who is the end user of this integration - who will use it"),
    dueDate: z
      .string()
      .optional()
      .describe("Due date if there is one (e.g., '2024-03-15' or 'end of Q1' or 'no deadline')"),
    contactPerson: z
      .string()
      .describe("The subject matter expert who knows the most about this request and should be contacted for follow-up questions. May or may not be the requester."),
  }),

  output: z.object({
    success: z.boolean(),
    requestId: z.number(),
    message: z.string(),
  }),

  handler: async ({
    title,
    description,
    priority,
    requestedByName,
    requestedByEmail,
    endUser,
    dueDate,
    contactPerson,
  }) => {
    const slackUserId = user.tags["slack:userId"] || user.tags.id || "unknown"

    const result = await IntegrationRequestsTable.createRows({
      rows: [
        {
          title,
          description,
          priority,
          status: "new",
          requestedBy: slackUserId,
          requestedByName,
          requestedByEmail,
          endUser,
          dueDate,
          contactPerson,
        },
      ],
    })

    const requestId = result.rows[0]?.id ?? 0

    bot.state.totalRequestsSubmitted += 1
    user.state.pendingRequest = undefined

    return {
      success: true,
      requestId,
      message: `Integration request #${requestId} has been successfully submitted with ${priority} priority.`,
    }
  },
})

export default saveIntegrationRequest
