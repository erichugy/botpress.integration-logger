export const TRIGGER_PHRASES = [
  "integration request",
  "new integration",
  "request an integration",
  "need an integration",
  "want an integration",
  "submit a request",
  "log a request",
  "integration idea",
] as const

export const PRIORITY_LEVELS = {
  low: "Nice to have, no timeline pressure",
  medium: "Would improve workflows",
  high: "Important, needed soon",
  critical: "Blocking current work",
} as const

export const REQUIRED_FIELDS = `Required information:
- Title: A brief, descriptive title (3-200 characters)
- Description: A detailed explanation of what the integration should do (10-2000 characters)
- Priority: One of: low, medium, high, or critical` as const

export const PRIORITY_GUIDANCE = `Priority guidance:
- low: Nice to have, no timeline pressure
- medium: Would improve workflows
- high: Important, needed soon
- critical: Blocking current work` as const
