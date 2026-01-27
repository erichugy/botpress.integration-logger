import { Action, actions, z } from "@botpress/runtime"

const SlackProfileResponseSchema = z.object({
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
})

const getSlackUserInfo = new Action({
  name: "getSlackUserInfo",
  description: "Extract Slack user ID and fetch display name from Slack API",
  input: z.object({
    messageUserId: z.string().describe("Slack user ID from message tags"),
    userTagId: z.string().optional().describe("Fallback Slack user ID from user tags"),
  }),
  output: z.object({
    slackUserId: z.string(),
    displayName: z.string().optional(),
  }),
  handler: async ({ input }) => {
    const slackUserId = input.messageUserId ?? input.userTagId ?? ""

    if (!slackUserId) return { slackUserId, displayName: undefined }

    try {
      const response = await actions.slack.getUserProfile({ userId: slackUserId })
      const result = SlackProfileResponseSchema.safeParse(response)

      if (!result.success) {
        return { slackUserId, displayName: undefined }
      }

      return {
        slackUserId,
        displayName: result.data.displayName ?? result.data.firstName,
      }
    } catch {
      return { slackUserId, displayName: undefined }
    }
  },
})

export default getSlackUserInfo
