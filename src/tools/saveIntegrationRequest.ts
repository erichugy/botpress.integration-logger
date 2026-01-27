import { Autonomous, z, user, bot } from "@botpress/runtime";
import { IntegrationRequestsTable } from "../tables/IntegrationRequestsTable";

export const saveIntegrationRequest = new Autonomous.Tool({
  name: "saveIntegrationRequest",
  description:
    "Save a new integration request to the database. Call this tool once you have gathered all required information: title, description, and priority.",

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
      .describe(
        "Priority level: low (nice-to-have), medium (useful), high (important), critical (urgent)"
      ),
    requestedByName: z
      .string()
      .optional()
      .describe("Display name of the person making the request"),
  }),

  output: z.object({
    success: z.boolean(),
    requestId: z.number(),
    message: z.string(),
  }),

  handler: async ({ title, description, priority, requestedByName }) => {
    const userId = user.tags.id || "unknown";

    const result = await IntegrationRequestsTable.createRows({
      rows: [
        {
          title,
          description,
          priority,
          status: "new",
          requestedBy: userId,
          requestedByName,
        },
      ],
    });

    const requestId = result.rows[0]?.id ?? 0;

    // Update bot stats
    bot.state.totalRequestsSubmitted += 1;

    // Clear user's pending request state
    user.state.pendingRequest = undefined;
    user.state.isSubmittingRequest = false;

    return {
      success: true,
      requestId,
      message: `Integration request #${requestId} has been successfully submitted with ${priority} priority.`,
    };
  },
});

export default saveIntegrationRequest;
