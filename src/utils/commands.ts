import { getPlatformConfig } from "../platforms"
import type { MessageFormatter } from "../platforms"
import type { Origin } from "../types"

export function buildHelpText(fmt: MessageFormatter): string {
  return `${fmt.bold("Integration Request Bot")}

I help you submit integration requests. Here's what I'll ask for:

${fmt.bold("Required:")}
${fmt.bullet("Your name")}
${fmt.bullet("Your email")}
${fmt.bullet("Title and description of the integration")}
${fmt.bullet("Priority level")}
${fmt.bullet("Who the end user is")}
${fmt.bullet("Contact person (subject matter expert for follow-up questions)")}

${fmt.bold("Optional:")}
${fmt.bullet("Due date (if any)")}

${fmt.bold("Commands:")}
${fmt.bullet(`${fmt.code("/help")} - Show this help message`)}
${fmt.bullet(`${fmt.code("/cancel")} - Cancel current request`)}

${fmt.bold("Priority levels:")}
${fmt.bullet(`${fmt.code("low")} - Nice to have`)}
${fmt.bullet(`${fmt.code("medium")} - Would be useful`)}
${fmt.bullet(`${fmt.code("high")} - Important for workflows`)}
${fmt.bullet(`${fmt.code("critical")} - Blocking work`)}

Just say "I need a new integration" to get started!`
}

export type CommandResult = {
  response: string
  shouldClearState: boolean
}

export function handleCommand(
  text: string,
  fmt: MessageFormatter,
  origin: Origin,
  userId?: string,
): CommandResult | null {
  const platform = getPlatformConfig(origin)
  const userTag = userId ? platform.mentionFormat(userId).replace(/[{}""]/g, "") + " " : ""
  const normalized = text.toLowerCase().trim()

  if (normalized === "/cancel" || normalized === "cancel") {
    return {
      response: `${userTag}Request cancelled. Let me know when you want to submit a new integration request.`,
      shouldClearState: true,
    }
  }

  if (normalized === "/help" || normalized === "help") {
    return {
      response: `${userTag}${buildHelpText(fmt)}`,
      shouldClearState: false,
    }
  }

  return null
}
