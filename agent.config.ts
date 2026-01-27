import "dotenv/config";
import { defineConfig, z } from "@botpress/runtime";

export default defineConfig({
  name: "integration-logger-bot",
  description: "Bot for logging integration requests via Slack conversations",

  defaultModels: {
    autonomous: "openai:gpt-4o",
    zai: "openai:gpt-4o-mini",
  },

  user: {
    state: z.object({
      // Track conversation stage for request collection
      pendingRequest: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        })
        .optional(),
      // Track if user is currently submitting a request
      isSubmittingRequest: z.boolean().default(false),
    }),
  },

  bot: {
    state: z.object({
      totalRequestsSubmitted: z.number().default(0),
    }),
  },

  dependencies: {
    integrations: {
      slack: {
        version: "slack@4.0.0",
        enabled: true,
        configurationType: "refreshToken",
        config: {
          refreshToken: process.env.SLACK_REFRESH_TOKEN,
          signingSecret: process.env.SLACK_SIGNING_SECRET,
          clientId: process.env.SLACK_CLIENT_ID,
          clientSecret: process.env.SLACK_CLIENT_SECRET,
          typingIndicatorEmoji: true,
          replyBehaviour: {
            location: "thread",
            onlyOnBotMention: false,
          },
        },
      },
    },
  },
});
