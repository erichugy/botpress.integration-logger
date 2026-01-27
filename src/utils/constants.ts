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

export const REQUIRED_FIELDS = `Required information to collect:
1. **Title** - A brief, descriptive title (3-200 characters)
2. **Description** - What the integration should do (10-2000 characters)
3. **Priority** - low, medium, high, or critical
4. **End user** - Who will be using this integration
5. **Contact person** - The subject matter expert for follow-up questions. Can be:
   - A Slack mention (e.g., @username) - we'll auto-fetch their name and email
   - A name - but then we need their email too
6. **Contact person email** - Required if contact person is a name (not a Slack mention)

Optional:
- **Requester email** - For follow-up if needed
- **Due date** - Is there a deadline? If so, when?

Note: Requester name is auto-filled from Slack profile.
` as const


export const PRIORITY_GUIDANCE = `Priority guidance:
- low: Nice to have, no timeline pressure
- medium: Would improve workflows
- high: Important, needed soon
- critical: Blocking current work` as const
