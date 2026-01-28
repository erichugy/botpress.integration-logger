import { Action, actions, context, z } from "@botpress/runtime"

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
    const logger = context.get("logger")
    const { name } = input
    logger.info("findSlackUserByName called", { input })

    try {
      const response = await actions.slack.findTarget({
        query: name,
        channel: "dm",
      })
      logger.info("findTarget response", { response })

      const result = FindTargetResponseSchema.safeParse(response)

      if (!result.success) {
        logger.error("Failed to parse findTarget response", { error: result.error })
        return { found: false, slackId: undefined, name: undefined, email: undefined }
      }

      if (result.data.targets.length === 0) {
        logger.info("No targets found for query", { query: name })
        return { found: false, slackId: undefined, name: undefined, email: undefined }
      }

      const target = result.data.targets[0]
      logger.debug("First target", { target })

      const slackId = target.tags.id
      logger.debug("Extracted slackId", { slackId })

      if (!slackId) {
        logger.info("No slackId in target tags", { displayName: target.displayName })
        return { found: false, slackId: undefined, name: target.displayName, email: undefined }
      }

      // NOTE: findTarget doesn't return email, so we fetch the full profile
      try {
        logger.info("Fetching full profile", { slackId })
        const profileResponse = await actions.slack.getUserProfile({ userId: slackId })
        logger.info("getUserProfile response", { profileResponse })

        const profileResult = SlackProfileResponseSchema.safeParse(profileResponse)

        if (profileResult.success) {
          const output = {
            found: true,
            slackId,
            name: profileResult.data.displayName ?? profileResult.data.firstName ?? target.displayName,
            email: profileResult.data.email,
          }
          logger.info("findSlackUserByName returning", { output })
          return output
        }
      } catch (profileError) {
        logger.error("Profile fetch failed", { error: profileError instanceof Error ? profileError.message : String(profileError) })
      }

      return { found: true, slackId, name: target.displayName, email: undefined }
    } catch (error) {
      logger.error("findSlackUserByName failed", { error: error instanceof Error ? error.message : String(error) })
      return { found: false, slackId: undefined, name: undefined, email: undefined }
    }
  },
})

export default findSlackUserByName
