import { Action, actions, z } from "@botpress/runtime"

const FindTargetResponseSchema = z.object({
  targets: z.array(
    z.object({
      displayName: z.string(),
      tags: z.object({
        id: z.string().optional(),
      }).passthrough(),
    }).passthrough()
  ),
})

const SlackProfileResponseSchema = z.object({
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
})

type Output = {
  found: boolean
  slackId: string | undefined
  name: string | undefined
  email: string | undefined
}

const findSlackUserByName = new Action({
  name: "findSlackUserByName",
  description:
    "Search for a Slack user by their name and get their Slack ID and contact info. Use this when you have a user's name (like 'Ermek Barmashev') but need their Slack ID to mention them or get their contact details.",

  input: z.object({
    name: z.string().describe("The name to search for (e.g., 'Ermek Barmashev', 'John')"),
  }),

  output: z.object({
    found: z.boolean().describe("Whether a matching user was found"),
    slackId: z.string().optional().describe("The Slack user ID if found"),
    name: z.string().optional().describe("The user's display name"),
    email: z.string().optional().describe("The user's email if available"),
  }),

  async handler({ input }): Promise<Output> {
    const { name } = input

    try {
      const response = await actions.slack.findTarget({
        query: name,
        channel: "dm",
      })

      const result = FindTargetResponseSchema.safeParse(response)

      if (!result.success || result.data.targets.length === 0) {
        return { found: false, slackId: undefined, name: undefined, email: undefined }
      }

      const target = result.data.targets[0]
      const slackId = target.tags.id

      if (!slackId) {
        return { found: false, slackId: undefined, name: target.displayName, email: undefined }
      }

      // NOTE: findTarget doesn't return email, so we fetch the full profile
      try {
        const profileResponse = await actions.slack.getUserProfile({ userId: slackId })
        const profileResult = SlackProfileResponseSchema.safeParse(profileResponse)

        if (profileResult.success) {
          return {
            found: true,
            slackId,
            name: profileResult.data.displayName ?? profileResult.data.firstName ?? target.displayName,
            email: profileResult.data.email,
          }
        }
      } catch {
        // NOTE: Profile fetch failed, fall through to return partial data
      }

      return { found: true, slackId, name: target.displayName, email: undefined }
    } catch {
      return { found: false, slackId: undefined, name: undefined, email: undefined }
    }
  },
})

export default findSlackUserByName
