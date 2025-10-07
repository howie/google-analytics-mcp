#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";

const analyticsadmin = google.analyticsadmin("v1beta");

interface CreateCustomDimensionArgs {
  propertyId: string;
  parameterName: string;
  displayName: string;
  description?: string;
  scope?: "EVENT" | "USER" | "ITEM";
}

interface CreateConversionEventArgs {
  propertyId: string;
  eventName: string;
}

interface ListResourceArgs {
  propertyId: string;
}

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
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
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
              description: "GA4 Property ID (e.g., 'G-859X61KC45' or '123456789')",
            },
            parameterName: {
              type: "string",
              description: "Event parameter name (e.g., 'method', 'session_id')",
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
        const {
          propertyId,
          parameterName,
          displayName,
          description = "",
          scope = "EVENT",
        } = args as CreateCustomDimensionArgs;

        // Convert property ID format if needed (G-XXXXXXXXX -> properties/XXXXXXXXX)
        const propertyPath = propertyId.startsWith("properties/")
          ? propertyId
          : `properties/${propertyId.replace("G-", "")}`;

        const response = await analyticsadmin.properties.customDimensions.create({
          parent: propertyPath,
          requestBody: {
            parameterName,
            displayName,
            description,
            scope,
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `✅ Created custom dimension: ${displayName}`,
                  dimension: response.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "create_conversion_event": {
        const { propertyId, eventName } = args as CreateConversionEventArgs;

        const propertyPath = propertyId.startsWith("properties/")
          ? propertyId
          : `properties/${propertyId.replace("G-", "")}`;

        const response = await analyticsadmin.properties.conversionEvents.create({
          parent: propertyPath,
          requestBody: {
            eventName,
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `✅ Marked as conversion: ${eventName}`,
                  event: response.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_custom_dimensions": {
        const { propertyId } = args as ListResourceArgs;

        const propertyPath = propertyId.startsWith("properties/")
          ? propertyId
          : `properties/${propertyId.replace("G-", "")}`;

        const response = await analyticsadmin.properties.customDimensions.list({
          parent: propertyPath,
        });

        const dimensions = response.data.customDimensions || [];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  count: dimensions.length,
                  dimensions: dimensions.map((d) => ({
                    name: d.name,
                    displayName: d.displayName,
                    parameterName: d.parameterName,
                    scope: d.scope,
                    description: d.description,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_conversion_events": {
        const { propertyId } = args as ListResourceArgs;

        const propertyPath = propertyId.startsWith("properties/")
          ? propertyId
          : `properties/${propertyId.replace("G-", "")}`;

        const response = await analyticsadmin.properties.conversionEvents.list({
          parent: propertyPath,
        });

        const events = response.data.conversionEvents || [];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  count: events.length,
                  events: events.map((e) => ({
                    name: e.name,
                    eventName: e.eventName,
                    createTime: e.createTime,
                    deletable: e.deletable,
                  })),
                },
                null,
                2
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
            2
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
