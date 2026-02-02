import { Conversation, actions, user, context } from "@botpress/runtime"
import { getMessageUserId, getPlatformConfig, getUserId } from "../platforms"
import { isBotMentionedInMessage, parseSlackMessage, conversationStateSchema } from "../platforms/slack"
import { buildInstructions } from "../utils/instructions"
import type { Origin } from "../types"

const ORIGIN: Origin = "slack"

/**
 * Handles messages from Slack channels (not threads).
 * Only responds when the bot is @mentioned.
 */
export const SlackChannel = new Conversation({
  channel: "slack.channel",

  state: conversationStateSchema,

  async handler({ message, conversation, state, execute }) {
    const logger = context.get("logger")
    logger.debug("SlackChannel handler - message", message);

    if (message?.type !== "text") {
      logger.debug("SlackChannel handler - message type is not text", message);
      return
    }

    const slackMessage = parseSlackMessage(message)
    if (!slackMessage) {
      logger.debug("SlackChannel handler - message is not a valid Slack message", message);
      return
    }

    const platform = getPlatformConfig(ORIGIN)

    // Check if bot is mentioned in the message
    const isBotMentioned = isBotMentionedInMessage(
      slackMessage.payload.mentions,
      "Botpress Integration Logger - Prod" //context.get("configuration").SLACK_BOT_USERNAME,
    )

    // Only respond if bot is mentioned
    if (!isBotMentioned) {
      logger.debug("SlackChannel handler - bot is not mentioned in the message", message);
      return
    }

    // Mark conversation as relevant for future thread messages
    conversation.tags.botMentioned = "true"

    const { slackUserId, displayName } = await actions.getSlackUserInfo({
      messageUserId: getMessageUserId(ORIGIN, slackMessage),
      userTagId: getUserId(ORIGIN, user),
    })

    const requesterContact = await actions.getSlackUserContact({
      slackUserId,
    })

    logger.debug("SlackChannel handler - executing instructions", {
      userId: slackUserId,
      userName: displayName,
      userEmail: requesterContact.email,
      pendingRequest: state.pendingRequest,
      isPublicChannel: true,
      origin: ORIGIN,
    });

    await execute({
      instructions: buildInstructions({
        userId: slackUserId,
        userName: displayName,
        userEmail: requesterContact.email,
        pendingRequest: state.pendingRequest,
        isPublicChannel: true,
        origin: ORIGIN,
      }),
      tools: platform.getTools(),
    })

    logger.debug("SlackChannel handler - completed", {
      conversationId: conversation.id,
      conversationTags: conversation.tags,
      conversationState: state,
    })
  },
})
