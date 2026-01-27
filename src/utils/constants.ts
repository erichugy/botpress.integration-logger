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
1. **Your name** - Who is making this request
2. **Your email** - For follow-up if needed
3. **Title** - A brief, descriptive title (3-200 characters)
4. **Description** - What the integration should do (10-2000 characters)
5. **Priority** - low, medium, high, or critical
6. **End user** - Who will be using this integration
7. **Due date** (optional) - Is there a deadline? If so, when?
8. **Contact person** - The subject matter expert who knows the most about this request. Who should we contact if we have follow-up questions? (may or may not be the requester)
9. **Contact person email** - The email of the contact person
` as const


export const PRIORITY_GUIDANCE = `Priority guidance:
- low: Nice to have, no timeline pressure
- medium: Would improve workflows
- high: Important, needed soon
- critical: Blocking current work` as const
