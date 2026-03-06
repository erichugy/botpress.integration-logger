import { actions } from "@botpress/runtime"
import { saveIntegrationRequest } from "../../tools/save-integration-request"
import { searchIntegrationRequests } from "../../tools/search-integration-requests"
import { updateIntegrationRequest } from "../../tools/update-integration-request"
import type { PlatformConfig } from "../types"

export const slackConfig: PlatformConfig = {
  origin: "slack",
  name: "Slack",
  getTools: () => [
    saveIntegrationRequest,
    searchIntegrationRequests,
    updateIntegrationRequest,
    actions.parseRelativeDate.asTool(),
    actions.slackResolveUserId.asTool(),
    actions.slackGetUserContact.asTool(),
    actions.slackFindUserByName.asTool(),
    actions.slackRelayToConversation.asTool(),
    actions.slackSubmitRelayResponse.asTool(),
    actions.slackCheckRelayResponses.asTool(),
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
- If you are given a Botpress user ID (starts with "user_"), call slackResolveUserId first to get a real Slack user ID (starts with "U").
- For the REQUESTER: Use slackGetUserContact with the current user's Slack ID to get their email. Pass this as requestedByEmail.
- For the CONTACT PERSON:
  - If given a Slack mention (user ID like U0A6E7PA7FH), use slackGetUserContact with that ID to get their email
  - If given a Botpress user ID (user_...), use slackResolveUserId first, then use slackGetUserContact with the resolved Slack ID
  - If given just a name (like "Ermek" or "John Smith"), use slackFindUserByName to find their Slack ID, then use slackGetUserContact to get their email
  - If slackFindUserByName doesn't find them OR slackGetUserContact returns no email, you MUST explicitly ask the user for the contact person's email
  - contactPersonEmail is MANDATORY - you cannot submit without it
- For CC LIST: If user gives Slack mentions instead of emails, use slackGetUserContact to get their emails. If user gives names, use slackFindUserByName then slackGetUserContact.`,
}
