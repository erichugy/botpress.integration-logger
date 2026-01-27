import { Conversation, actions, user } from "@botpress/runtime"

import { saveIntegrationRequest } from "../tools/saveIntegrationRequest"
import { handleCommand } from "../utils/commands"
import { slackFormatter } from "../utils/formatters"
import { buildInstructions } from "../utils/instructions"
import { isIntegrationRelated } from "../utils/relevance"
import { parseSlackMessage } from "../utils/slack-schemas"

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

    const { slackUserId, displayName } = await actions.getSlackUserInfo({
      messageUserId: slackMessage.tags["slack:userId"],
      userTagId: user.tags["slack:id"],
    })

    const commandResult = handleCommand(text, slackFormatter, slackUserId)
    if (commandResult) {
      if (commandResult.shouldClearState) {
        user.state.pendingRequest = undefined
        user.state.activeConversation = false
      }
      await conversation.send({
        type: "text",
        payload: { text: commandResult.response },
      })
      return
    }

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
        pendingRequest: user.state.pendingRequest,
        isPublicChannel: false,
      }),
      tools: [
        saveIntegrationRequest,
        actions.parseRelativeDate.asTool(),
        actions.getSlackUserContact.asTool(),
        actions.findSlackUserByName.asTool(),
      ],
    })
  },
})
