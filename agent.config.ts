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
    state: z.object({
      // Track conversation stage for request collection
      pendingRequest: z
        .object({
          requestedByName: z.string().optional(),
          requestedByEmail: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "critical"]).optional(),
          endUser: z.string().optional(),
          dueDate: z.string().optional(),
          contactPerson: z.string().optional(),
          contactPersonEmail: z.string().optional(),
        })
        .optional(),
    }),
    tags: {
      // user-level tags
    }
  },

  conversation: {
    tags: {
      // Conversation-level tags
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
    schema: z.object({
      // Configuration schema for your agent
      // Accessible via `configuration` export
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
