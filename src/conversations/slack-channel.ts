import { Conversation, user } from "@botpress/runtime";
import { saveIntegrationRequest } from "../tools/saveIntegrationRequest";

// Trigger phrases that indicate someone wants to submit an integration request
const TRIGGER_PHRASES = [
  "integration request",
  "new integration",
  "request an integration",
  "need an integration",
  "want an integration",
  "submit a request",
  "log a request",
  "integration idea",
];

export const SlackChannel = new Conversation({
  channel: "slack.channel",

  async handler({ message, conversation, execute }) {
    // Only process text messages
    if (message?.type !== "text") {
      return;
    }

    const text = message.payload.text.toLowerCase();

    // Check if message contains any trigger phrases
    const isTriggered = TRIGGER_PHRASES.some((phrase) =>
      text.includes(phrase)
    );

    // If not triggered, don't respond (avoid being noisy in channels)
    if (!isTriggered) {
      return;
    }

    // Respond to the trigger
    await execute({
      instructions: `You are an Integration Request Bot responding in a public Slack channel.

Someone mentioned an integration request. Your job is to:
1. Acknowledge their request briefly
2. Try to gather the integration details from their message (title, description, priority)
3. If they provided enough detail, save the request using the tool
4. If they didn't provide enough detail, ask for the missing information

Keep responses SHORT and professional - this is a public channel.

Required information:
- Title: Brief name for the request (3-200 chars)
- Description: What should the integration do (10-2000 chars)
- Priority: low, medium, high, or critical

If the user's message already contains enough context:
- Extract a suitable title from their description
- Use their explanation as the description
- Default to "medium" priority unless they indicate urgency

After saving, confirm with the request ID and thank them.

Example good responses:
- "Got it! I've logged your request for a Salesforce integration (#123). I'll track this as medium priority."
- "Thanks for the request! To log this properly, what priority level: low, medium, high, or critical?"

Current user: ${user.tags.id || "unknown"}`,
      tools: [saveIntegrationRequest],
    });
  },
});
