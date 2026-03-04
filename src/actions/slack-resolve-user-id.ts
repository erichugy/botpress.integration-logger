import { Action, context, z } from "@botpress/runtime"
import { SLACK_TAG_KEYS } from "../platforms/slack/tags"

const SLACK_USER_ID_REGEX = /^U[A-Z0-9]+$/
const SLACK_MENTION_REGEX = /^<@([A-Z0-9]+)>$/
const BOTPRESS_USER_ID_REGEX = /^user_[A-Za-z0-9]+$/

const inputSchema = z.object({
  identifier: z
    .string()
    .min(1)
    .describe("Slack user ID (U...), Slack mention (<@U...>), or Botpress user ID (user_...)"),
})

const outputSchema = z.object({
  resolved: z.boolean(),
  inputType: z.enum(["slack", "botpress", "unknown"]),
  slackUserId: z.string().optional(),
  botpressUserId: z.string().optional(),
  reason: z.string().optional(),
})

type Output = z.infer<typeof outputSchema>

function parseSlackUserId(identifier: string): string | undefined {
  const trimmed = identifier.trim()

  const mentionMatch = SLACK_MENTION_REGEX.exec(trimmed)
  if (mentionMatch) {
    return mentionMatch[1]
  }

  if (SLACK_USER_ID_REGEX.test(trimmed)) {
    return trimmed
  }

  return undefined
}

const slackResolveUserId = new Action({
  name: "slackResolveUserId",
  description:
    "Resolve a Slack user ID from either a Slack ID/mention or a Botpress user ID. Use this when an input might be a Botpress user ID (user_...) and you need a Slack U... ID.",
  input: inputSchema,
  output: outputSchema,
  async handler({ input }): Promise<Output> {
    const client = context.get("client")
    const logger = context.get("logger")
    const trimmed = input.identifier.trim()

    const slackUserId = parseSlackUserId(trimmed)
    if (slackUserId) {
      return {
        resolved: true,
        inputType: "slack",
        slackUserId,
      }
    }

    if (!BOTPRESS_USER_ID_REGEX.test(trimmed)) {
      return {
        resolved: false,
        inputType: "unknown",
        reason: `Identifier "${trimmed}" is neither a Slack user ID (U...) nor a Botpress user ID (user_...).`,
      }
    }

    try {
      const { user } = await client.getUser({ id: trimmed })
      const taggedSlackUserId = user.tags[SLACK_TAG_KEYS.userId]

      if (!taggedSlackUserId) {
        return {
          resolved: false,
          inputType: "botpress",
          botpressUserId: trimmed,
          reason: `Botpress user "${trimmed}" has no "${SLACK_TAG_KEYS.userId}" tag.`,
        }
      }

      if (!SLACK_USER_ID_REGEX.test(taggedSlackUserId)) {
        return {
          resolved: false,
          inputType: "botpress",
          botpressUserId: trimmed,
          reason: `Botpress user "${trimmed}" has invalid Slack tag value "${taggedSlackUserId}".`,
        }
      }

      return {
        resolved: true,
        inputType: "botpress",
        botpressUserId: trimmed,
        slackUserId: taggedSlackUserId,
      }
    } catch (error) {
      logger.error("slackResolveUserId failed", {
        identifier: trimmed,
        error: error instanceof Error ? error.message : String(error),
      })
      return {
        resolved: false,
        inputType: "botpress",
        botpressUserId: trimmed,
        reason: `Could not load Botpress user "${trimmed}".`,
      }
    }
  },
})

export default slackResolveUserId
