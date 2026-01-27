import { Conversation, user } from "@botpress/runtime"
import { saveIntegrationRequest } from "../tools/saveIntegrationRequest"
import { TRIGGER_PHRASES } from "../utils/constants"
import { buildInstructions } from "../utils/instructions"

export const SlackChannel = new Conversation({
  channel: "slack.channel",

  async handler({ message, conversation, execute }) {
    if (message?.type !== "text") {
      return
    }

    const text = message.payload.text.toLowerCase()
    const isTriggered = TRIGGER_PHRASES.some((phrase) => text.includes(phrase))

    if (!isTriggered) {
      return
    }

    await execute({
      instructions: buildInstructions({
        userId: user.tags.id || "unknown",
        pendingRequest: user.state.pendingRequest,
        isPublicChannel: true,
      }),
      tools: [saveIntegrationRequest],
    })
  },
})
