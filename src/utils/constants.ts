export const REQUIRED_FIELDS = `Required information to collect (MUST have all before saving):
1. **Title** - A brief, descriptive title (3-200 characters). Suggest one based on what the user said.
2. **Description** - What the integration should do (10-2000 characters). Suggest one based on what the user said.
3. **Priority** - low, medium, high, or critical
4. **End user** - Who will be using this integration
5. **Due date** - When is this needed? Ask explicitly.
6. **Contact person** - The subject matter expert for follow-up questions. IMPORTANT: If the user says THEY are the contact person (e.g., "I am the point of contact", "contact me"), use the requester's name and email - do NOT ask again.
7. **Contact person email** - REQUIRED. If contact person = requester, use requester's email. If given a Slack mention, use getSlackUserContact. If given just a name, ask for their email.

Optional:
- **CC list** - Email addresses of anyone else who should be notified about this request

Auto-populated (do not ask):
- Requester name: From Slack profile
- Requester email: Use getSlackUserContact with the requester's Slack ID to get this
- Origin: Always "slack" for now
` as const


export const PRIORITY_GUIDANCE = `Priority guidance:
- low: Nice to have, no timeline pressure
- medium: Would improve workflows
- high: Important, needed soon
- critical: Blocking current work` as const
