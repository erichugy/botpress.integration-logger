import { Action, actions, z } from "@botpress/runtime"

const SLACK_MENTION_REGEX = /<@([A-Z0-9]+)>/

const SlackProfileResponseSchema = z.object({
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
})

type Output = {
  name: string
  email: string | undefined
  slackId: string | undefined
}

const resolveContactPerson = new Action({
  name: "resolveContactPerson",
  description: "Resolve contact person info from Slack mention or name/email",
  input: z.object({
    contactInput: z.string().describe("Slack mention (e.g., <@U123ABC>) or name"),
    emailIfProvided: z.string().optional().describe("Email if explicitly provided"),
  }),
  output: z.object({
    name: z.string(),
    email: z.string().optional(),
    slackId: z.string().optional(),
  }),
  async handler({ input }): Promise<Output> {
    const { contactInput, emailIfProvided } = input
    const slackMatch = SLACK_MENTION_REGEX.exec(contactInput)

    if (slackMatch) {
      const slackId = slackMatch[1]

      try {
        const response = await actions.slack.getUserProfile({ userId: slackId })
        const result = SlackProfileResponseSchema.safeParse(response)

        if (result.success) {
          const profile = result.data
          const name = profile.displayName ?? profile.firstName ?? contactInput
          return {
            name,
            email: emailIfProvided ?? profile.email,
            slackId,
          }
        }
      } catch {
        // Failed to fetch profile, use the mention as-is
      }

      return {
        name: contactInput,
        email: emailIfProvided,
        slackId,
      }
    }

    // Not a Slack mention - try to infer name from email if no name given
    let name = contactInput
    let inferredEmail = emailIfProvided

    if (emailIfProvided && !contactInput) {
      // Infer name from email (e.g., "john.doe@company.com" -> "John Doe")
      const emailPrefix = emailIfProvided.split("@")[0]
      if (emailPrefix) {
        name = emailPrefix
          .split(/[._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(" ")
      }
    }

    return {
      name,
      email: inferredEmail,
      slackId: undefined,
    }
  },
})

export default resolveContactPerson
