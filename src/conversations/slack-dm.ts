import { Conversation, actions, user } from "@botpress/runtime"
import { getMessageUserId, getPlatformConfig, getUserId } from "../platforms"
import { parseSlackMessage, getSlackChannelOrigin, conversationStateSchema } from "../platforms/slack"
import { loadPendingRelayContext, markRelayContextConsumed } from "../platforms/slack/relayContext"
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

  async handler({ message, conversation, state, execute }) {
    if (message?.type !== "text") {
      return
    }

    const slackMessage = parseSlackMessage(message)
    if (!slackMessage) {
      return
    }

    const platform = getPlatformConfig(ORIGIN)
    const channelOrigin = getSlackChannelOrigin(slackMessage)

    const { slackUserId, displayName } = await actions.getSlackUserInfo({
      messageUserId: getMessageUserId(ORIGIN, slackMessage),
      userTagId: getUserId(ORIGIN, user),
    })

    const requesterContact = await actions.getSlackUserContact({
      slackUserId,
    })

    const relayContext = await loadPendingRelayContext(conversation.tags)

    await execute({
      instructions: buildInstructions({
        userId: slackUserId,
        userName: displayName,
        userEmail: requesterContact.email,
        pendingRequest: state.pendingRequest,
        channelOrigin,
        relayContext: relayContext
          ? {
              relayId: relayContext.relayId,
              summary: relayContext.summary,
              payload: relayContext.payload,
              sourceConversationId: relayContext.sourceConversationId,
              sourceChannelOrigin: relayContext.sourceChannelOrigin,
            }
          : undefined,
        isPublicChannel: false,
        origin: ORIGIN,
      }),
      tools: platform.getTools(),
    })

    if (relayContext) {
      await markRelayContextConsumed(conversation, relayContext.rowId)
    }
  },
})
