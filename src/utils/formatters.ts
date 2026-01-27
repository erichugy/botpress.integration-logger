export type MessageFormatter = {
  bold: (text: string) => string
  code: (text: string) => string
  bullet: (text: string) => string
}

export const slackFormatter: MessageFormatter = {
  bold: (t) => `*${t}*`,
  code: (t) => `\`${t}\``,
  bullet: (t) => `• ${t}`,
}

export const discordFormatter: MessageFormatter = {
  bold: (t) => `**${t}**`,
  code: (t) => `\`${t}\``,
  bullet: (t) => `• ${t}`,
}
