import type { SlackMention } from "./schemas";
import { context } from "@botpress/runtime";
import { RuntimeError } from "@botpress/sdk";

/**
 * Check if the bot is mentioned in a Slack message.
 *
 * Slack mentions can be either:
 * - Plain strings (user IDs like "U0XXXXXXX")
 * - Objects with user_id field
 */
export function isBotMentionedInMessage(
  mentions: SlackMention[],
  botUsername: string,
): boolean {
  if (!botUsername) {
    throw new RuntimeError(
      "Bot username is not defined. Please add it to .env.SLACK_BOT_USERNAME or provide it as a parameter",
    );
  }

  const logger = context.get("logger");
  logger.debug("isBotMentionedInMessage - mentions", mentions);
  logger.debug("isBotMentionedInMessage - botUsername", botUsername);
  return mentions.some((mention) => mention.user.name === botUsername || mention.user.id === botUsername);
}
