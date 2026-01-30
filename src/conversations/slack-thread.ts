import { Conversation, actions, user, z, context } from "@botpress/runtime";
import { getMessageUserId, getPlatformConfig, getUserId } from "../platforms";
import { isBotMentionedInMessage, parseSlackMessage } from "../platforms/slack";
import { buildInstructions } from "../utils/instructions";
import type { Origin } from "../types";

const ORIGIN: Origin = "slack";

export const SlackThread = new Conversation({
  channel: "slack.thread",

  state: z.object({
    pendingRequest: z
      .object({
        requestedByName: z.string().optional(),
        requestedByEmail: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        endUser: z.string().optional(),
        dueDate: z.string().optional(),
        contactPersonInput: z.string().optional(),
        contactPersonEmail: z.string().optional(),
      })
      .optional(),
  }),

  async handler({ message, conversation, state, execute }) {
    if (message?.type !== "text") {
      return;
    }

    const slackMessage = parseSlackMessage(message);
    if (!slackMessage) {
      return;
    }

    const text = slackMessage.payload.text;
    const platform = getPlatformConfig(ORIGIN);

    // Check if bot was previously mentioned in this conversation
    const wasBotMentioned = conversation.tags.botMentioned === "true";

    // Check if bot is mentioned in current message
    const isBotMentionedNow = isBotMentionedInMessage(
      slackMessage.payload.mentions,
      context.get("configuration").SLACK_BOT_USERNAME,
    );

    // Only respond if bot was mentioned at some point in this conversation
    if (!wasBotMentioned && !isBotMentionedNow) {
      return;
    }

    // Mark conversation as active for future messages
    if (isBotMentionedNow && !wasBotMentioned) {
      conversation.tags.botMentioned = "true";
    }

    const { slackUserId, displayName } = await actions.getSlackUserInfo({
      messageUserId: getMessageUserId(ORIGIN, slackMessage),
      userTagId: getUserId(ORIGIN, user),
    });

    const requesterContact = await actions.getSlackUserContact({
      slackUserId,
    });

    await execute({
      instructions: buildInstructions({
        userId: slackUserId,
        userName: displayName,
        userEmail: requesterContact.email,
        pendingRequest: state.pendingRequest,
        isPublicChannel: false,
        origin: ORIGIN,
      }),
      tools: platform.getTools(),
    });
  },
});
