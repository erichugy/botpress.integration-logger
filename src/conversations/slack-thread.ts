import { Conversation, actions, user } from "@botpress/runtime"

import { getPlatformConfig } from "../platforms"
import { parseSlackMessage } from "../platforms/slack"
// import { slackFormatter } from "../platforms/slack"
// import { handleCommand } from "../utils/commands"
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
      messageUserId: slackMessage.tags["slack:userId"],
      userTagId: user.tags["slack:id"],
    })
    console.log('User info:', JSON.stringify({ slackUserId, displayName }));

    const requesterContact = await actions.getSlackUserContact({
      slackUserId,
    })
    console.log('Requester contact:', JSON.stringify(requesterContact));

    // const commandResult = handleCommand(text, slackFormatter, ORIGIN, slackUserId)
    // if (commandResult) {
    //   if (commandResult.shouldClearState) {
    //     user.state.pendingRequest = undefined
    //     user.state.activeConversation = false
    //   }
    //   await conversation.send({
    //     type: "text",
    //     payload: { text: commandResult.response },
    //   })
    //   return
    // }

    const isActiveConversation =
      user.state.activeConversation === true ||
      user.state.pendingRequest !== undefined ||
      conversation.tags["slack:isBotReplyThread"] === "true"

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
