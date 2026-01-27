import { Conversation, user } from "@botpress/runtime"
import { saveIntegrationRequest } from "../tools/saveIntegrationRequest"
import { slackFormatter } from "../utils/formatters"
import { handleCommand } from "../utils/commands"
import { buildInstructions } from "../utils/instructions"

export const SlackDM = new Conversation({
  channel: "slack.dm",

  async handler({ message, conversation, execute }) {
    if (message?.type !== "text") {
      await conversation.send({
        type: "text",
        payload: {
          text: "I can help you submit integration requests. Just describe what you need!",
        },
      })
      return
    }

    const text = message.payload.text

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

    await execute({
      instructions: buildInstructions({
        userId: user.tags.id || "unknown",
        pendingRequest: user.state.pendingRequest,
        isPublicChannel: false,
      }),
      tools: [saveIntegrationRequest],
    })
  },
})
