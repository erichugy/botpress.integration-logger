import { actions } from "@botpress/runtime"
import { saveIntegrationRequest } from "../../tools/saveIntegrationRequest"
import { searchIntegrationRequests } from "../../tools/searchIntegrationRequests"
import { updateIntegrationRequest } from "../../tools/updateIntegrationRequest"
import type { PlatformConfig } from "../types"

export const slackConfig: PlatformConfig = {
  origin: "slack",
  name: "Slack",
  getTools: () => [
    saveIntegrationRequest,
    searchIntegrationRequests,
    updateIntegrationRequest,
    actions.parseRelativeDate.asTool(),
    actions.getSlackUserContact.asTool(),
    actions.findSlackUserByName.asTool(),
  ],
  mentionFormat: (userId: string) => `{"<@${userId}>"}`,
  mentionInstructions: `CRITICAL - Slack mentions:
Valid Slack user IDs start with "U" followed by uppercase alphanumeric (e.g., U0A6E7PA7FH).

ONLY use mention syntax for valid Slack IDs:
CORRECT:   {"<@U0A6E7PA7FH>"}   (valid Slack ID starting with U)
WRONG:     {"<@haris mahmood>"}  (name, not an ID)
WRONG:     {"<@user_01KG0EHN...>"} (internal ID, not Slack ID)
WRONG:     <@anything>           (breaks JSX)

RULE: If you don't have a valid Slack user ID (starting with U), just write the person's name as plain text.
Example: "Contact person: John Smith" NOT "Contact person: {"<@john smith>"}"`,
  userLookupInstructions: `Getting emails (CRITICAL - use Slack tools):
- For the REQUESTER: Use getSlackUserContact with the current user's Slack ID to get their email. Pass this as requestedByEmail.
- For the CONTACT PERSON:
  - If given a Slack mention (user ID like U0A6E7PA7FH), use getSlackUserContact with that ID to get their email
  - If given just a name (like "Ermek" or "John Smith"), use findSlackUserByName to find their Slack ID, then use getSlackUserContact to get their email
  - If findSlackUserByName doesn't find them OR getSlackUserContact returns no email, you MUST explicitly ask the user for the contact person's email
  - contactPersonEmail is MANDATORY - you cannot submit without it
- For CC LIST: If user gives Slack mentions instead of emails, use getSlackUserContact to get their emails. If user gives names, use findSlackUserByName then getSlackUserContact.`,
}
