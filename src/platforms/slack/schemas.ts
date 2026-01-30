import { z } from "@botpress/runtime";

// NOTE: Zod schemas kept private to avoid non-portable type inference errors
// when exporting. Types are inferred from schemas per convention.

const SlackMessageTagsSchema = z.object({
  "slack:ts": z.string(),
  "slack:userId": z.string(),
  "slack:channelId": z.string(),
  "slack:forkedToThread": z.string().optional(),
});

// NOTE: Slack mentions can be strings (user IDs) or objects depending on message source
const SlackMentionSchema = z.object({
  type: z.string().optional(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .passthrough(),
});

const SlackMessageSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  conversationId: z.string(),
  userId: z.string(),
  type: z.literal("text"),
  direction: z.literal("incoming"),
  payload: z.object({
    text: z.string(),
    mentions: z.array(SlackMentionSchema),
  }),
  tags: SlackMessageTagsSchema,
});

export type SlackMention = z.infer<typeof SlackMentionSchema>;
export type SlackMessage = z.infer<typeof SlackMessageSchema>;

export function parseSlackMessage(message: unknown): SlackMessage | null {
  const result = SlackMessageSchema.safeParse(message);
  return result.success ? result.data : null;
}
