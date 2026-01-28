import type { MessageFormatter } from "../types"

export const slackFormatter: MessageFormatter = {
  bold: (t) => `*${t}*`,
  code: (t) => `\`${t}\``,
  bullet: (t) => `• ${t}`,
}
