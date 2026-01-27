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
      }
      await conversation.send({
        type: "text",
        payload: { text: commandResult.response },
      })
      return
    }

    const hasPendingRequest = user.state.pendingRequest !== undefined
    const botHasReplied = conversation.tags["slack:isBotReplyThread"] === "true"
    const isActiveConversation = hasPendingRequest || botHasReplied

    if (!isActiveConversation) {
      const isRelevant = await isIntegrationRelated(text)
      if (!isRelevant) {
        return
      }
    }

    await execute({
      instructions: buildInstructions({
        userId: slackUserId,
        userName: displayName,
        pendingRequest: user.state.pendingRequest,
        isPublicChannel: false,
      }),
      tools: [saveIntegrationRequest],
    })
  },
})
