import { Action, actions, z } from "@botpress/runtime"

const SlackProfileResponseSchema = z.object({
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
})

type Output = {
  name: string
  email: string | undefined
  slackId: string
}

const getSlackUserContact = new Action({
  name: "getSlackUserContact",
  description:
    "Get a Slack user's contact information (name, email) from their Slack user ID. Use this when you have a Slack user ID like U0A6E7PA7FH and need their contact details.",

  input: z.object({
    slackUserId: z
      .string()
      .describe("The Slack user ID (e.g., U0A6E7PA7FH) - NOT the mention format like <@U0A6E7PA7FH>"),
  }),

  output: z.object({
    name: z.string().describe("The user's display name or first name"),
    email: z.string().optional().describe("The user's email address if available"),
    slackId: z.string().describe("The Slack user ID"),
  }),

  async handler({ input }): Promise<Output> {
    const { slackUserId } = input

    // NOTE: LLM sometimes passes mention format <@U123> instead of just U123
    const cleanId = slackUserId.replace(/<@([A-Z0-9]+)>/, "$1")

    try {
      const response = await actions.slack.getUserProfile({ userId: cleanId })
      const result = SlackProfileResponseSchema.safeParse(response)

      if (!result.success) {
        return { name: cleanId, email: undefined, slackId: cleanId }
      }

      const profile = result.data
      const name = profile.displayName ?? profile.firstName ?? cleanId

      return {
        name,
        email: profile.email,
        slackId: cleanId,
      }
    } catch {
      return { name: cleanId, email: undefined, slackId: cleanId }
    }
  },
})

export default getSlackUserContact
