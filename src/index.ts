#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";

import {
  createConversionEvent,
  createCustomDimension,
  listConversionEvents,
  listCustomDimensions,
  type CreateConversionEventArgs,
  type CreateCustomDimensionArgs,
  type ListResourceArgs,
} from "./tools.js";

const analyticsadmin = google.analyticsadmin("v1beta");

// Initialize auth client
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/analytics.edit",
      "https://www.googleapis.com/auth/analytics.readonly",
    ],
  });
  return await auth.getClient();
}

// Create MCP server
const server = new Server(
  {
    name: "ga4-admin-server",
    version: "0.1.1",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_custom_dimension",
        description: "Create a custom dimension in Google Analytics 4",
        inputSchema: {
          type: "object",
          properties: {
            propertyId: {
              type: "string",
              description:
                "GA4 Property ID (e.g., 'G-859X61KC45' or '123456789')",
            },
            parameterName: {
              type: "string",
              description:
                "Event parameter name (e.g., 'method', 'session_id')",
            },
            displayName: {
              type: "string",
              description: "Display name shown in GA4 UI",
            },
            description: {
              type: "string",
              description: "Optional description of the dimension",
            },
            scope: {
              type: "string",
              enum: ["EVENT", "USER", "ITEM"],
              description: "Dimension scope (default: EVENT)",
            },
          },
          required: ["propertyId", "parameterName", "displayName"],
        },
      },
      {
        name: "create_conversion_event",
        description: "Mark an event as a conversion in Google Analytics 4",
        inputSchema: {
          type: "object",
          properties: {
            propertyId: {
              type: "string",
              description: "GA4 Property ID",
            },
            eventName: {
              type: "string",
              description: "Event name to mark as conversion",
            },
          },
          required: ["propertyId", "eventName"],
        },
      },
      {
        name: "list_custom_dimensions",
        description: "List all custom dimensions in a GA4 property",
        inputSchema: {
          type: "object",
          properties: {
            propertyId: {
              type: "string",
              description: "GA4 Property ID",
            },
          },
          required: ["propertyId"],
        },
      },
      {
        name: "list_conversion_events",
        description: "List all conversion events in a GA4 property",
        inputSchema: {
          type: "object",
          properties: {
            propertyId: {
              type: "string",
              description: "GA4 Property ID",
            },
          },
          required: ["propertyId"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const authClient = await getAuthClient();
    google.options({ auth: authClient as any });

    switch (name) {
      case "create_custom_dimension": {
        const dimension = await createCustomDimension(
          analyticsadmin,
          args as unknown as CreateCustomDimensionArgs,
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `✅ Created custom dimension: ${dimension.displayName}`,
                  dimension,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "create_conversion_event": {
        const event = await createConversionEvent(
          analyticsadmin,
          args as unknown as CreateConversionEventArgs,
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `✅ Marked as conversion: ${event.eventName}`,
                  event,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "list_custom_dimensions": {
        const result = await listCustomDimensions(
          analyticsadmin,
          args as unknown as ListResourceArgs,
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  count: result.dimensions.length,
                  dimensions: result.dimensions,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "list_conversion_events": {
        const result = await listConversionEvents(
          analyticsadmin,
          args as unknown as ListResourceArgs,
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  count: result.events.length,
                  events: result.events,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: error.message,
              details: error.errors || error.response?.data,
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GA4 Admin MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
