/**
 * Mock Google APIs for Testing
 *
 * Provides mock implementations of Google Analytics Admin API
 * to avoid making real API calls during unit tests.
 */

export const mockCustomDimension = {
  name: 'properties/123456/customDimensions/1',
  parameterName: 'test_param',
  displayName: 'Test Dimension',
  description: 'A test custom dimension',
  scope: 'EVENT',
  disallowAdsPersonalization: false,
};

export const mockConversionEvent = {
  name: 'properties/123456/conversionEvents/1',
  eventName: 'test_conversion',
  createTime: '2025-10-07T00:00:00Z',
  deletable: true,
  custom: true,
};

export const mockAnalyticsAdminClient = {
  properties: {
    customDimensions: {
      create: jest.fn().mockResolvedValue({
        data: mockCustomDimension,
      }),
      list: jest.fn().mockResolvedValue({
        data: {
          customDimensions: [mockCustomDimension],
          nextPageToken: null,
        },
      }),
      get: jest.fn().mockResolvedValue({
        data: mockCustomDimension,
      }),
    },
    conversionEvents: {
      create: jest.fn().mockResolvedValue({
        data: mockConversionEvent,
      }),
      list: jest.fn().mockResolvedValue({
        data: {
          conversionEvents: [mockConversionEvent],
          nextPageToken: null,
        },
      }),
      get: jest.fn().mockResolvedValue({
        data: mockConversionEvent,
      }),
    },
  },
};

export const mockGoogleAuth = {
  getClient: jest.fn().mockResolvedValue({}),
};

/**
 * Mock googleapis module
 */
export const mockGoogleApis = {
  google: {
    analyticsadmin: jest.fn().mockReturnValue(mockAnalyticsAdminClient),
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => mockGoogleAuth),
    },
  },
};

/**
 * Helper to reset all mocks
 */
export const resetAllMocks = () => {
  mockAnalyticsAdminClient.properties.customDimensions.create.mockClear();
  mockAnalyticsAdminClient.properties.customDimensions.list.mockClear();
  mockAnalyticsAdminClient.properties.customDimensions.get.mockClear();
  mockAnalyticsAdminClient.properties.conversionEvents.create.mockClear();
  mockAnalyticsAdminClient.properties.conversionEvents.list.mockClear();
  mockAnalyticsAdminClient.properties.conversionEvents.get.mockClear();
  mockGoogleAuth.getClient.mockClear();
};
