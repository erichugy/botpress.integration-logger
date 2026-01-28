import { actions } from "@botpress/runtime"

import { saveIntegrationRequest } from "../../tools/saveIntegrationRequest"
import type { PlatformConfig } from "../types"

export const slackConfig: PlatformConfig = {
  origin: "slack",
  name: "Slack",
  getTools: () => [
    saveIntegrationRequest,
    actions.parseRelativeDate.asTool(),
    actions.getSlackUserContact.asTool(),
    actions.findSlackUserByName.asTool(),
  ],
  mentionFormat: (userId: string) => `{"<@${userId}>"}`,
  mentionInstructions: `CRITICAL - Slack mentions in JSX:
- NEVER write a Slack mention like <@Ermek Barmashev> directly in your response - it will break JSX parsing
- If you have a Slack ID (like U0A6E7PA7FH), wrap it as a string: {"<@U0A6E7PA7FH>"}
- If you only have a name and no Slack ID, just write the name as plain text without the <@> wrapper`,
  userLookupInstructions: `Getting emails (CRITICAL - use Slack tools):
- For the REQUESTER: Use getSlackUserContact with the current user's Slack ID to get their email. Pass this as requestedByEmail.
- For the CONTACT PERSON:
  - If given a Slack mention like <@U0A6E7PA7FH>, use getSlackUserContact with that ID to get their email
  - If given just a name (like "Ermek" or "John Smith"), use findSlackUserByName to find their Slack ID, then use getSlackUserContact to get their email
  - If findSlackUserByName doesn't find them OR getSlackUserContact returns no email, you MUST explicitly ask the user for the contact person's email
  - contactPersonEmail is MANDATORY - you cannot submit without it
- For CC LIST: If user gives Slack mentions instead of emails, use getSlackUserContact to get their emails. If user gives names, use findSlackUserByName then getSlackUserContact.`,
}
