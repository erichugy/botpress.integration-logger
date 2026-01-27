import type { MessageFormatter } from "./formatters"

export function buildHelpText(fmt: MessageFormatter): string {
  return `${fmt.bold("Integration Request Bot")}

I help you submit integration requests. Here's how to use me:

${fmt.bullet("Just tell me about the integration you need")}
${fmt.bullet("I'll gather the details: title, description, and priority")}
${fmt.bullet("Once complete, I'll save your request")}

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
  fmt: MessageFormatter
): CommandResult | null {
  const normalized = text.toLowerCase().trim()

  if (normalized === "/cancel" || normalized === "cancel") {
    return {
      response: "Request cancelled. Let me know when you want to submit a new integration request.",
      shouldClearState: true,
    }
  }

  if (normalized === "/help" || normalized === "help") {
    return {
      response: buildHelpText(fmt),
      shouldClearState: false,
    }
  }

  return null
}
