import { Autonomous, actions, bot, user, z } from "@botpress/runtime"

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
    requestedByName: z.string().describe("Name of the person making this request"),
    requestedByEmail: z
      .string()
      .email()
      .optional()
      .describe("Email of the person making this request (if provided)"),
    endUser: z.string().describe("Who is the end user of this integration - who will use it"),
    dueDate: z
      .string()
      .optional()
      .describe("Due date if there is one (e.g., '2024-03-15' or 'end of Q1' or 'no deadline')"),
    contactPersonInput: z
      .string()
      .describe(
        "The contact person - can be a Slack mention (e.g., <@U123ABC>) or a name. This is the subject matter expert for follow-up questions."
      ),
    contactPersonEmail: z
      .string()
      .email()
      .optional()
      .describe("Email of the contact person (required if not providing a Slack mention)"),
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
  }) => {
    const requestedBySlackId = user.tags["slack:id"] ?? "unknown"

    const contactPerson = await actions.resolveContactPerson({
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
          requestedBy: requestedBySlackId,
          requestedByName,
          requestedByEmail,
          endUser,
          dueDate,
          contactPersonName: contactPerson.name,
          contactPersonEmail: contactPerson.email,
          contactPersonSlackId: contactPerson.slackId,
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
