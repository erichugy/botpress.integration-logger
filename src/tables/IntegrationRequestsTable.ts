import { Table, z } from "@botpress/runtime";

export const IntegrationRequestsTable = new Table({
  name: "IntegrationRequestsTable",
  description: "Stores integration requests submitted by users via Slack",

  columns: {
    title: {
      schema: z.string().describe("Brief title of the integration request"),
      searchable: true,
    },
    description: {
      schema: z
        .string()
        .describe("Detailed description of the integration request"),
      searchable: true,
    },
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .describe("Priority level of the request"),
    status: z
      .enum(["new", "on_hold", "in_progress", "completed", "rejected"])
      .default("new")
      .describe("Current status of the request"),
    requestedBy: z.string().describe("Slack user ID of the requester"),
    requestedByName: z
      .string()
      .optional()
      .describe("Display name of the requester"),
  },
});
