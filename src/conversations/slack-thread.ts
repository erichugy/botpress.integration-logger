import { Conversation, actions, user, context } from "@botpress/runtime"
import { getMessageUserId, getPlatformConfig, getUserId } from "../platforms"
import { isBotMentionedInMessage, parseSlackMessage, conversationStateSchema } from "../platforms/slack"
import { buildInstructions } from "../utils/instructions"
import type { Origin } from "../types"

const ORIGIN: Origin = "slack"

/**
 * Handles messages from Slack threads.
 * Responds if:
 * - Bot was previously mentioned in this conversation (conversation is "relevant")
 * - Bot is mentioned in the current message (marks conversation as relevant)
 */
export const SlackThread = new Conversation({
  channel: "slack.thread",

  state: conversationStateSchema,

  async handler({ message, conversation, state, execute }) {

    const logger = context.get("logger")
    logger.debug("SlackThread handler - message", message);
    logger.debug("Conversation tags", conversation.tags);

    if (message?.type !== "text") return

    const slackMessage = parseSlackMessage(message)
    if (!slackMessage) return

    const platform = getPlatformConfig(ORIGIN)

    // Check if bot was previously mentioned in this conversation
    const wasBotMentioned = conversation.tags.botMentioned === "true"

    // Check if bot is mentioned in current message
    const isBotMentionedNow = isBotMentionedInMessage(
      slackMessage.payload.mentions,
      context.get("configuration").SLACK_BOT_USERNAME,
    )

    // Only respond if bot was mentioned at some point in this conversation
    if (!wasBotMentioned && !isBotMentionedNow) return

    // Mark conversation as relevant for future messages
    if (isBotMentionedNow && !wasBotMentioned) conversation.tags.botMentioned = "true"

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
        isPublicChannel: true,
        origin: ORIGIN,
      }),
      tools: platform.getTools(),
    })
  },
})
