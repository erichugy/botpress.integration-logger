import { Conversation, user } from "@botpress/runtime"
import { saveIntegrationRequest } from "../tools/saveIntegrationRequest"
import { slackFormatter } from "../utils/formatters"
import { handleCommand } from "../utils/commands"
import { buildInstructions } from "../utils/instructions"
import { isIntegrationRelated } from "../utils/relevance"

export const SlackThread = new Conversation({
  channel: "slack.thread",

  async handler({ message, conversation, execute }) {
    if (message?.type !== "text") {
      return
    }

    const text = message.payload.text

    // Always handle commands
    const commandResult = handleCommand(text, slackFormatter)
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

    await conversation.send({
      type: "text",
      payload: { text: JSON.stringify(conversation) },
    })
    await conversation.send({
      type: "text",
      payload: { text: JSON.stringify(user) },
    })
    await conversation.send({
      type: "text",
      payload: { text: JSON.stringify(message) },
    })

    // Check if we're in an active conversation
    const hasPendingRequest = user.state.pendingRequest !== undefined
    const botHasReplied = conversation.tags["slack:isBotReplyThread"] === "true"
    const isActiveConversation = hasPendingRequest || botHasReplied

    // If no active conversation, check if message is integration-related
    if (!isActiveConversation) {
      const isRelevant = await isIntegrationRelated(text)
      if (!isRelevant) {
        await conversation.send({
          type: "text",
          payload: { text: "I'm sorry, I can only help with integration requests. Please start a new conversation if you have a different request." },
        })
        return
      }
    }

    // Extract user info from Slack tags
    const userId = user.tags["slack:userId"] || user.tags.id || "unknown"
    const userName = user.tags["slack:name"] || user.tags.name || undefined

    await execute({
      instructions: buildInstructions({
        userId,
        userName,
        pendingRequest: user.state.pendingRequest,
        isPublicChannel: false,
      }),
      tools: [saveIntegrationRequest],
    })
  },
})
