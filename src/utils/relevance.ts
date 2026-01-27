import { adk } from "@botpress/runtime"

const RELEVANCE_CONDITION = `is related to software integrations, APIs, system connections, data syncing, automation requests, or is a follow-up to an integration request conversation (like answering questions about priority, end users, deadlines, contact info, or confirming details)`

export async function isIntegrationRelated(message: string): Promise<boolean> {
  return adk.zai.check(message, RELEVANCE_CONDITION)
}
