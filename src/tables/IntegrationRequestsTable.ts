import { Table, z } from "@botpress/runtime"

export const IntegrationRequestsTable = new Table({
  name: "IntegrationRequestsTable",
  description: "Stores integration requests submitted by users via Slack",

  columns: {
    title: {
      schema: z.string().describe("Brief title of the integration request"),
      searchable: true,
    },
    description: {
      schema: z.string().describe("Detailed description of the integration request"),
      searchable: true,
    },
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .describe("Priority level of the request"),
    status: z
      .enum(["new", "on_hold", "in_progress", "completed", "rejected"])
      .default("new")
      .describe("Current status of the request"),
    origin: z
      .string()
      .default("slack")
      .describe("Origin application of the request (e.g., slack, discord)"),
    requestedBy: z.string().describe("Slack user ID of the requester"),
    requestedByName: z.string().describe("Name of the person making the request"),
    requestedByEmail: z
      .string()
      .optional()
      .describe("Email of the person making the request"),
    endUser: z
      .string()
      .describe("Who is the end user of this integration"),
    dueDate: z
      .string()
      .optional()
      .describe("Due date for the integration if applicable (ISO format or descriptive)"),
    contactPersonName: z
      .string()
      .describe("Name of the subject matter expert to contact for follow-up questions"),
    contactPersonEmail: z
      .string()
      .describe("Email of the subject matter expert (required)"),
    ccList: z
      .array(z.string().email())
      .optional()
      .describe("List of email addresses to CC on updates about this request"),
  },
})
