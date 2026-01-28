import { Conversation, actions, user } from "@botpress/runtime"
import { getMessageUserId, getPlatformConfig, getUserId, isBotReplyThread } from "../platforms"
import { parseSlackMessage } from "../platforms/slack"
import { buildInstructions } from "../utils/instructions"
import { isIntegrationRelated } from "../utils/relevance"
import type { Origin } from "../types"

const ORIGIN: Origin = "slack"

export const SlackThread = new Conversation({
  channel: "slack.thread",

  async handler({ message, conversation, execute }) {
    if (message?.type !== "text") {
      return
    }

    const slackMessage = parseSlackMessage(message)
    if (!slackMessage) {
      return
    }

    const text = slackMessage.payload.text
    const platform = getPlatformConfig(ORIGIN)

    const { slackUserId, displayName } = await actions.getSlackUserInfo({
      messageUserId: getMessageUserId(ORIGIN, slackMessage),
      userTagId: getUserId(ORIGIN, user),
    })

    const requesterContact = await actions.getSlackUserContact({
      slackUserId,
    })

    const isActiveConversation =
      user.state.activeConversation === true ||
      user.state.pendingRequest !== undefined ||
      isBotReplyThread(ORIGIN, conversation)

    if (!isActiveConversation) {
      const isRelevant = await isIntegrationRelated(text)
      if (!isRelevant) {
        return
      }
    }

    // Mark conversation as active so we continue responding
    user.state.activeConversation = true

    await execute({
      instructions: buildInstructions({
        userId: slackUserId,
        userName: displayName,
        userEmail: requesterContact.email,
        pendingRequest: user.state.pendingRequest,
        isPublicChannel: false,
        origin: ORIGIN,
      }),
      tools: platform.getTools(),
    })
  },
})
