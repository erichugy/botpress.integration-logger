import "dotenv/config";
import { defineConfig, z } from "@botpress/runtime";

export default defineConfig({
  name: "integration-logger-bot",
  description: "Bot for logging integration requests via Slack conversations",

  defaultModels: {
    autonomous: "openai:gpt-4o",
    zai: "openai:gpt-4o-mini",
  },

  bot: {
    state: z.object({
      totalRequestsSubmitted: z.number().default(0),
    }),
  },

  user: {
    state: z.object({}),
    tags: {},
  },

  conversation: {
    tags: {
      botMentioned: {
        title: "Bot Mentioned",
        description: "Whether the bot has been mentioned in this conversation",
      },
      relayContextId: {
        title: "Relay Context ID",
        description: "Pointer to supplementary context stored for this conversation",
      },
      relayContextPending: {
        title: "Relay Context Pending",
        description: "Whether this conversation has pending supplementary relay context",
      },
      relaySourceConversationId: {
        title: "Relay Source Conversation ID",
        description: "Source conversation that initiated relay context for this conversation",
      },
      relayCreatedAt: {
        title: "Relay Created At",
        description: "ISO timestamp when relay context was attached to this conversation",
      },
    },
  },

  message: {
    tags: {
      // Message-level tags
    },
  },

  workflow: {
    tags: {
      // Workflow-level tags
    },
  },

  configuration: {
    schema: z.object({}),
  },

  dependencies: {
    integrations: {
      slack: {
        version: "erichuang/slack@4.1.0",
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
