import { Conversation, user } from "@botpress/runtime";
import { saveIntegrationRequest } from "../tools/saveIntegrationRequest";

export const SlackDM = new Conversation({
  channel: "slack.dm",

  async handler({ message, conversation, execute }) {
    // Handle non-text messages
    if (message?.type !== "text") {
      await conversation.send({
        type: "text",
        payload: {
          text: "I can help you submit integration requests. Just describe what you need!",
        },
      });
      return;
    }

    const text = message.payload.text.toLowerCase();

    // Check for cancel command
    if (text === "/cancel" || text === "cancel") {
      user.state.pendingRequest = undefined;
      user.state.isSubmittingRequest = false;
      await conversation.send({
        type: "text",
        payload: {
          text: "Request cancelled. Let me know when you want to submit a new integration request.",
        },
      });
      return;
    }

    // Check for help command
    if (text === "/help" || text === "help") {
      await conversation.send({
        type: "text",
        payload: {
          text: `*Integration Request Bot*

I help you submit integration requests. Here's how to use me:

• Just tell me about the integration you need
• I'll gather the details: title, description, and priority
• Once complete, I'll save your request

*Commands:*
• \`/help\` - Show this help message
• \`/cancel\` - Cancel current request

*Priority levels:*
• \`low\` - Nice to have
• \`medium\` - Would be useful
• \`high\` - Important for workflows
• \`critical\` - Blocking work

Just say "I need a new integration" to get started!`,
        },
      });
      return;
    }

    // Use AI to handle the conversation naturally
    await execute({
      instructions: `You are an Integration Request Bot that helps users submit integration requests.

Your goal is to collect three pieces of information through natural conversation:
1. **Title**: A brief, descriptive title (3-200 characters)
2. **Description**: A detailed explanation of what the integration should do (10-2000 characters)
3. **Priority**: One of: low, medium, high, or critical

Guidelines:
- Be conversational and helpful
- If the user mentions an integration need, start gathering details
- Ask clarifying questions if the request is vague
- Once you have all three pieces of information, use the saveIntegrationRequest tool
- Confirm the submission with the request ID
- Keep responses concise - this is Slack, not email

Priority guidance to share with users:
- low: Nice to have, no timeline pressure
- medium: Would improve workflows
- high: Important, needed soon
- critical: Blocking current work

Current user state:
${user.state.pendingRequest ? `Pending request: ${JSON.stringify(user.state.pendingRequest)}` : "No pending request"}

If the user hasn't started a request yet and says something like "hi" or asks a general question, briefly explain what you do and offer to help them submit an integration request.`,
      tools: [saveIntegrationRequest],
    });
  },
});
