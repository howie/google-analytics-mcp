import type { analyticsadmin_v1beta } from "googleapis";

export type AnalyticsAdminClient = analyticsadmin_v1beta.Analyticsadmin;

export interface CreateCustomDimensionArgs {
  propertyId: string;
  parameterName: string;
  displayName: string;
  description?: string;
  scope?: "EVENT" | "USER" | "ITEM";
}

export interface CreateConversionEventArgs {
  propertyId: string;
  eventName: string;
}

export interface ListResourceArgs {
  propertyId: string;
  pageSize?: number;
  pageToken?: string;
}

export async function resolvePropertyId(
  analyticsadmin: AnalyticsAdminClient,
  propertyId: string,
): Promise<string> {
  if (propertyId.startsWith("properties/")) {
    return propertyId;
  }

  if (propertyId.startsWith("G-")) {
    const accounts = await analyticsadmin.accountSummaries.list();
    const accountSummaries = accounts.data.accountSummaries ?? [];

    for (const accountSummary of accountSummaries) {
      const propertySummaries = accountSummary.propertySummaries ?? [];

      for (const propertySummary of propertySummaries) {
        const propertyName = propertySummary.property ?? "";
        if (!propertyName) {
          continue;
        }

        const streams = await analyticsadmin.properties.dataStreams.list({
          parent: propertyName,
        });

        const dataStreams = streams.data.dataStreams ?? [];
        for (const stream of dataStreams) {
          if (stream.webStreamData?.measurementId === propertyId) {
            return propertyName;
          }
        }
      }
    }

    throw new Error(`No property found with measurement ID: ${propertyId}`);
  }

  return `properties/${propertyId}`;
}

export async function createCustomDimension(
  analyticsadmin: AnalyticsAdminClient,
  args: CreateCustomDimensionArgs,
) {
  const {
    propertyId,
    parameterName,
    displayName,
    description = "",
    scope = "EVENT",
  } = args;

  const propertyPath = await resolvePropertyId(analyticsadmin, propertyId);

  const response = await analyticsadmin.properties.customDimensions.create({
    parent: propertyPath,
    requestBody: {
      parameterName,
      displayName,
      description,
      scope,
    },
  });

  return response.data;
}

export async function createConversionEvent(
  analyticsadmin: AnalyticsAdminClient,
  args: CreateConversionEventArgs,
) {
  const { propertyId, eventName } = args;

  const propertyPath = await resolvePropertyId(analyticsadmin, propertyId);

  const response = await analyticsadmin.properties.conversionEvents.create({
    parent: propertyPath,
    requestBody: {
      eventName,
    },
  });

  return response.data;
}

export async function listCustomDimensions(
  analyticsadmin: AnalyticsAdminClient,
  args: ListResourceArgs,
) {
  const { propertyId, pageSize, pageToken } = args;
  const propertyPath = await resolvePropertyId(analyticsadmin, propertyId);
  const request: {
    parent: string;
    pageSize?: number;
    pageToken?: string;
  } = {
    parent: propertyPath,
  };

  if (pageSize !== undefined) {
    request.pageSize = pageSize;
  }
  if (pageToken !== undefined) {
    request.pageToken = pageToken;
  }

  const response =
    await analyticsadmin.properties.customDimensions.list(request);

  const dimensions = response.data.customDimensions ?? [];

  return {
    dimensions: dimensions.map((dimension) => ({
      name: dimension.name,
      displayName: dimension.displayName,
      parameterName: dimension.parameterName,
      scope: dimension.scope,
      description: dimension.description,
    })),
    nextPageToken: response.data.nextPageToken ?? null,
  };
}

export async function listConversionEvents(
  analyticsadmin: AnalyticsAdminClient,
  args: ListResourceArgs,
) {
  const { propertyId, pageSize, pageToken } = args;
  const propertyPath = await resolvePropertyId(analyticsadmin, propertyId);
  const request: {
    parent: string;
    pageSize?: number;
    pageToken?: string;
  } = {
    parent: propertyPath,
  };

  if (pageSize !== undefined) {
    request.pageSize = pageSize;
  }
  if (pageToken !== undefined) {
    request.pageToken = pageToken;
  }

  const response =
    await analyticsadmin.properties.conversionEvents.list(request);

  const events = response.data.conversionEvents ?? [];

  return {
    events: events.map((event) => ({
      name: event.name,
      eventName: event.eventName,
      createTime: event.createTime,
      deletable: event.deletable,
      custom: event.custom,
    })),
    nextPageToken: response.data.nextPageToken ?? null,
  };
}
