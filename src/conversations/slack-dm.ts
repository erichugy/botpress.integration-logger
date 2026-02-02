import { Conversation, actions, user, context } from "@botpress/runtime"
import { getMessageUserId, getPlatformConfig, getUserId } from "../platforms"
import { parseSlackMessage, conversationStateSchema } from "../platforms/slack"
import { buildInstructions } from "../utils/instructions"
import type { Origin } from "../types"

const ORIGIN: Origin = "slack"

/**
 * Handles direct messages from Slack.
 * Always responds - no mention check required for DMs.
 */
export const SlackDM = new Conversation({
  channel: "slack.dm",

  state: conversationStateSchema,

  async handler({ message, state, execute }) {
    if (message?.type !== "text") {
      return
    }

    const slackMessage = parseSlackMessage(message)
    if (!slackMessage) {
      return
    }

    const platform = getPlatformConfig(ORIGIN)

    const { slackUserId, displayName } = await actions.getSlackUserInfo({
      messageUserId: getMessageUserId(ORIGIN, slackMessage),
      userTagId: getUserId(ORIGIN, user),
    })

    const requesterContact = await actions.getSlackUserContact({
      slackUserId,
    })

    await execute({
      instructions: buildInstructions({
        userId: slackUserId,
        userName: displayName,
        userEmail: requesterContact.email,
        pendingRequest: state.pendingRequest,
        isPublicChannel: false,
        origin: ORIGIN,
      }),
      tools: platform.getTools(),
    })
  },
})
