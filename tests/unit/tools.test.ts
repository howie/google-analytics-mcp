import {
  createConversionEvent,
  createCustomDimension,
  listConversionEvents,
  listCustomDimensions,
  resolvePropertyId,
  type AnalyticsAdminClient,
  type CreateConversionEventArgs,
  type CreateCustomDimensionArgs,
  type ListResourceArgs,
} from "../../src/tools";

interface FakeOptions {
  customDimensionData?: any;
  customDimensionsListData?: any[];
  conversionEventData?: any;
  conversionEventsListData?: any[];
  dataStreamsByProperty?: Record<string, any[]>;
  accountSummaries?: Array<{
    propertySummaries?: Array<{
      property?: string;
    }>;
  }>;
}

class FakeAnalyticsAdmin {
  public customDimensionsCreateCalls: any[] = [];
  public customDimensionsListCalls: any[] = [];
  public conversionEventsCreateCalls: any[] = [];
  public conversionEventsListCalls: any[] = [];
  public dataStreamsListCalls: any[] = [];
  public accountSummariesCalls = 0;

  public customDimensionData: any;
  public customDimensionsListData: any[];
  public conversionEventData: any;
  public conversionEventsListData: any[];
  public dataStreamsByProperty: Record<string, any[]>;
  public accountSummariesData: Array<{
    propertySummaries?: Array<{
      property?: string;
    }>;
  }>;

  private nextCustomDimensionError?: unknown;
  private nextConversionEventError?: unknown;

  constructor(options: FakeOptions = {}) {
    this.customDimensionData =
      options.customDimensionData ?? {
        name: "properties/123456/customDimensions/1",
        parameterName: "test_param",
        displayName: "Test Dimension",
        description: "A test custom dimension",
        scope: "EVENT",
        disallowAdsPersonalization: false,
      };

    this.customDimensionsListData =
      options.customDimensionsListData ?? [this.customDimensionData];

    this.conversionEventData =
      options.conversionEventData ?? {
        name: "properties/123456/conversionEvents/1",
        eventName: "test_conversion",
        createTime: "2025-10-07T00:00:00Z",
        deletable: true,
        custom: true,
      };

    this.conversionEventsListData =
      options.conversionEventsListData ?? [this.conversionEventData];

    this.dataStreamsByProperty =
      options.dataStreamsByProperty ?? Object.create(null);

    this.accountSummariesData = options.accountSummaries ?? [];
  }

  public setNextCustomDimensionError(error: unknown) {
    this.nextCustomDimensionError = error;
  }

  public setNextConversionEventError(error: unknown) {
    this.nextConversionEventError = error;
  }

  public readonly properties = {
    customDimensions: {
      create: async (request: any) => {
        this.customDimensionsCreateCalls.push(request);
        if (this.nextCustomDimensionError) {
          const error = this.nextCustomDimensionError;
          this.nextCustomDimensionError = undefined;
          throw error;
        }
        return { data: this.customDimensionData };
      },
      list: async (request: any) => {
        this.customDimensionsListCalls.push(request);
        return {
          data: {
            customDimensions: this.customDimensionsListData.map((dimension) => ({
              ...dimension,
            })),
            nextPageToken: null,
          },
        };
      },
    },
    conversionEvents: {
      create: async (request: any) => {
        this.conversionEventsCreateCalls.push(request);
        if (this.nextConversionEventError) {
          const error = this.nextConversionEventError;
          this.nextConversionEventError = undefined;
          throw error;
        }
        return { data: this.conversionEventData };
      },
      list: async (request: any) => {
        this.conversionEventsListCalls.push(request);
        return {
          data: {
            conversionEvents: this.conversionEventsListData.map((event) => ({
              ...event,
            })),
            nextPageToken: null,
          },
        };
      },
    },
    dataStreams: {
      list: async (request: any) => {
        this.dataStreamsListCalls.push(request);
        const parent = request.parent;
        const dataStreams = this.dataStreamsByProperty[parent] ?? [];
        return {
          data: {
            dataStreams: dataStreams.map((stream) => ({ ...stream })),
          },
        };
      },
    },
  };

  public readonly accountSummaries = {
    list: async () => {
      this.accountSummariesCalls += 1;
      return {
        data: {
          accountSummaries: this.accountSummariesData.map((summary) => ({
            ...summary,
            propertySummaries: summary.propertySummaries?.map((property) => ({
              ...property,
            })),
          })),
        },
      };
    },
  };
}

const asClient = (fake: FakeAnalyticsAdmin): AnalyticsAdminClient =>
  fake as unknown as AnalyticsAdminClient;

describe("resolvePropertyId", () => {
  it("returns property path when already formatted", async () => {
    const client = new FakeAnalyticsAdmin();

    await expect(
      resolvePropertyId(asClient(client), "properties/999999"),
    ).resolves.toBe("properties/999999");
    expect(client.accountSummariesCalls).toBe(0);
  });

  it("prefixes numeric property ids", async () => {
    const client = new FakeAnalyticsAdmin();
    await expect(
      resolvePropertyId(asClient(client), "123456"),
    ).resolves.toBe("properties/123456");
  });

  it("resolves measurement ids via data streams", async () => {
    const client = new FakeAnalyticsAdmin({
      accountSummaries: [
        {
          propertySummaries: [
            {
              property: "properties/777777",
            },
          ],
        },
      ],
      dataStreamsByProperty: {
        "properties/777777": [
          {
            webStreamData: {
              measurementId: "G-TEST1234",
            },
          },
        ],
      },
    });

    await expect(
      resolvePropertyId(asClient(client), "G-TEST1234"),
    ).resolves.toBe("properties/777777");
    expect(client.accountSummariesCalls).toBe(1);
    expect(client.dataStreamsListCalls[0]).toEqual({
      parent: "properties/777777",
    });
  });

  it("throws when measurement id is not found", async () => {
    const client = new FakeAnalyticsAdmin({
      accountSummaries: [
        {
          propertySummaries: [
            {
              property: "properties/100000",
            },
          ],
        },
      ],
      dataStreamsByProperty: {
        "properties/100000": [],
      },
    });

    await expect(
      resolvePropertyId(asClient(client), "G-NOTFOUND"),
    ).rejects.toThrow("No property found with measurement ID: G-NOTFOUND");
  });
});

describe("createCustomDimension", () => {
  const baseArgs: CreateCustomDimensionArgs = {
    propertyId: "123456",
    parameterName: "test_param",
    displayName: "Test Dimension",
    description: "Unit test dimension",
  };

  it("creates a custom dimension with defaults", async () => {
    const client = new FakeAnalyticsAdmin();

    const result = await createCustomDimension(asClient(client), baseArgs);

    expect(client.customDimensionsCreateCalls).toHaveLength(1);
    expect(client.customDimensionsCreateCalls[0]).toEqual({
      parent: "properties/123456",
      requestBody: {
        parameterName: "test_param",
        displayName: "Test Dimension",
        description: "Unit test dimension",
        scope: "EVENT",
      },
    });
    expect(result.parameterName).toBe("test_param");
    expect(result.displayName).toBe("Test Dimension");
  });

  it("passes through custom scope values", async () => {
    const client = new FakeAnalyticsAdmin();

    await createCustomDimension(asClient(client), {
      ...baseArgs,
      scope: "USER",
    });

    expect(client.customDimensionsCreateCalls[0].requestBody.scope).toBe(
      "USER",
    );
  });

  it("propagates API errors", async () => {
    const client = new FakeAnalyticsAdmin();
    const apiError = { code: 409, message: "Duplicate dimension" };
    client.setNextCustomDimensionError(apiError);

    await expect(
      createCustomDimension(asClient(client), baseArgs),
    ).rejects.toBe(apiError);
  });
});

describe("createConversionEvent", () => {
  const baseArgs: CreateConversionEventArgs = {
    propertyId: "123456",
    eventName: "purchase_completed",
  };

  it("marks an event as conversion", async () => {
    const client = new FakeAnalyticsAdmin();

    const result = await createConversionEvent(asClient(client), baseArgs);

    expect(client.conversionEventsCreateCalls).toHaveLength(1);
    expect(client.conversionEventsCreateCalls[0]).toEqual({
      parent: "properties/123456",
      requestBody: {
        eventName: "purchase_completed",
      },
    });
    expect(result.eventName).toBe("test_conversion");
    expect(result.custom).toBe(true);
  });

  it("propagates API errors", async () => {
    const client = new FakeAnalyticsAdmin();
    const apiError = { code: 409, message: "Event already conversion" };
    client.setNextConversionEventError(apiError);

    await expect(
      createConversionEvent(asClient(client), baseArgs),
    ).rejects.toBe(apiError);
  });
});

describe("listCustomDimensions", () => {
  const args: ListResourceArgs = { propertyId: "123456" };

  it("returns mapped custom dimensions", async () => {
    const client = new FakeAnalyticsAdmin();

    const result = await listCustomDimensions(asClient(client), args);

    expect(client.customDimensionsListCalls).toHaveLength(1);
    expect(client.customDimensionsListCalls[0]).toEqual({
      parent: "properties/123456",
    });
    expect(result.dimensions).toHaveLength(1);
    expect(result.dimensions[0]).toMatchObject({
      parameterName: "test_param",
      displayName: "Test Dimension",
      scope: "EVENT",
    });
    expect(result.nextPageToken).toBeNull();
  });

  it("handles empty responses", async () => {
    const client = new FakeAnalyticsAdmin();
    client.customDimensionsListData = [];

    const result = await listCustomDimensions(asClient(client), args);

    expect(result.dimensions).toHaveLength(0);
  });
});

describe("listConversionEvents", () => {
  const args: ListResourceArgs = { propertyId: "123456" };

  it("returns mapped conversion events", async () => {
    const client = new FakeAnalyticsAdmin();

    const result = await listConversionEvents(asClient(client), args);

    expect(client.conversionEventsListCalls).toHaveLength(1);
    expect(client.conversionEventsListCalls[0]).toEqual({
      parent: "properties/123456",
    });
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      eventName: "test_conversion",
      deletable: true,
    });
    expect(result.nextPageToken).toBeNull();
  });

  it("handles empty conversion lists", async () => {
    const client = new FakeAnalyticsAdmin();
    client.conversionEventsListData = [];

    const result = await listConversionEvents(asClient(client), args);

    expect(result.events).toHaveLength(0);
  });
});
