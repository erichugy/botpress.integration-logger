import { Action, actions, z, context } from "@botpress/runtime"

// Matches valid Slack user ID mentions like <@U0A6E7PA7FH>
const SLACK_USER_ID_REGEX = /<@([A-Z0-9]+)>/

// Matches any <@...> pattern (to clean up malformed mentions)
const SLACK_MENTION_WRAPPER_REGEX = /<@([^>]+)>/

const SlackProfileResponseSchema = z.object({
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
})

const outputSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  slackId: z.string().optional(),
})

const resolveSlackContactPerson = new Action({
  name: "resolveSlackContactPerson",
  description: "Resolve contact person info from Slack mention or name/email",
  input: z.object({
    contactInput: z.string().describe("Slack mention (e.g., <@U123ABC>) or name"),
    emailIfProvided: z.string().optional().describe("Email if explicitly provided"),
  }),
  output: outputSchema,
  async handler({ input }): Promise<z.infer<typeof outputSchema>> {
    const { contactInput, emailIfProvided } = input
    const logger = context.get("logger")
    logger.info("resolveSlackContactPerson called", { input })

    // Check for valid Slack user ID mention (e.g., <@U0A6E7PA7FH>)
    const validSlackMatch = SLACK_USER_ID_REGEX.exec(contactInput)

    if (validSlackMatch) {
      const slackId = validSlackMatch[1]

      try {
        const response = await actions.slack.getUserProfile({ userId: slackId })
        const result = SlackProfileResponseSchema.safeParse(response)

        if (result.success) {
          const profile = result.data
          const name = profile.displayName ?? profile.firstName ?? slackId
          return {
            name,
            email: emailIfProvided ?? profile.email,
            slackId,
          }
        }
      } catch {
        // Failed to fetch profile, return the ID as name
      }

      return {
        name: slackId,
        email: emailIfProvided,
        slackId,
      }
    }

    // Check for malformed mention like <@Haris Mahmood> and extract the name
    const malformedMatch = SLACK_MENTION_WRAPPER_REGEX.exec(contactInput)
    let cleanedName = contactInput

    if (malformedMatch) {
      cleanedName = malformedMatch[1] // Extract "Haris Mahmood" from "<@Haris Mahmood>"
    }

    // Handle placeholder values that should be empty
    if (cleanedName === "-" || cleanedName.toLowerCase() === "n/a" || cleanedName === "") {
      cleanedName = "Unknown"
    }

    // If no name but email provided, infer name from email
    if (emailIfProvided && cleanedName === "Unknown") {
      const emailPrefix = emailIfProvided.split("@")[0]
      if (emailPrefix && emailPrefix !== "-") {
        cleanedName = emailPrefix
          .split(/[._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(" ")
      }
    }

    // Clean up email if it's a placeholder
    const cleanedEmail =
      emailIfProvided && emailIfProvided !== "-" && emailIfProvided.toLowerCase() !== "n/a"
        ? emailIfProvided
        : undefined

    return {
      name: cleanedName,
      email: cleanedEmail,
      slackId: undefined,
    }
  },
})

export default resolveSlackContactPerson
