import { Autonomous, actions, bot, user, z } from "@botpress/runtime"
import { getUserId } from "../platforms"
import { IntegrationRequestsTable } from "../tables/IntegrationRequestsTable"
import type { Origin } from "../types"

export const saveIntegrationRequest: Autonomous.Tool = new Autonomous.Tool({
  name: "saveIntegrationRequest",
  description:
    "Save a new integration request to the database. Call this tool once you have gathered ALL required information from the user.",

  input: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200)
      .describe("Brief, descriptive title for the integration request"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000)
      .describe("Detailed description of what the integration should do"),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .describe("Priority level: low (nice-to-have), medium (useful), high (important), critical (urgent)"),
    requestedByName: z
      .string()
      .min(1, "Requester name is required")
      .describe("Name of the person making this request"),
    requestedByEmail: z
      .string()
      .email()
      .optional()
      .describe("Email of the requester - use getSlackUserContact to fetch this from their Slack ID"),
    endUser: z
      .string()
      .min(1, "End user is required")
      .describe("Who is the end user of this integration - who will use it"),
    dueDate: z
      .string()
      .optional()
      .describe("Due date in ISO format (YYYY-MM-DD) - use parseRelativeDate to convert relative dates"),
    contactPersonInput: z
      .string()
      .min(1, "Contact person is required")
      .describe(
        "The contact person - can be a Slack mention (e.g., <@U123ABC>) or a name. This is the subject matter expert for follow-up questions."
      ),
    contactPersonEmail: z
      .string()
      .email()
      .describe("Email of the contact person (REQUIRED - use getSlackUserContact if you have their Slack ID, otherwise ask the user)"),
    ccList: z
      .array(z.string().email())
      .optional()
      .describe("List of email addresses to CC on updates about this request"),
    origin: z
      .string()
      .default("slack")
      .describe("Origin application of the request (defaults to 'slack')"),
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
    contactPersonInput,
    contactPersonEmail,
    ccList,
    origin,
  }) => {
    const requestedByPlatformId = getUserId(origin as Origin, user) ?? "unknown"

    // NOTE: resolveSlackContactPerson handles both Slack mentions and plain names
    const contactPerson = await actions.resolveSlackContactPerson({
      contactInput: contactPersonInput,
      emailIfProvided: contactPersonEmail,
    })

    const result = await IntegrationRequestsTable.createRows({
      rows: [
        {
          title,
          description,
          priority,
          status: "new",
          origin: origin ?? "slack",
          requestedBy: requestedByPlatformId,
          requestedByName,
          requestedByEmail,
          endUser,
          dueDate,
          contactPersonName: contactPerson.name,
          contactPersonEmail: contactPersonEmail,
          ccList,
        },
      ],
    })

    const requestId = result.rows[0]?.id ?? 0

    bot.state.totalRequestsSubmitted += 1
    user.state.pendingRequest = undefined
    user.state.activeConversation = false

    return {
      success: true,
      requestId,
      message: `Integration request #${requestId} has been successfully submitted with ${priority} priority.`,
    }
  },
})

export default saveIntegrationRequest
