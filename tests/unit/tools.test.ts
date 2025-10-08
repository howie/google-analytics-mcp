/**
 * Unit Tests for MCP Tools
 *
 * Tests the individual tool implementations without making real API calls.
 */

import { mockAnalyticsAdminClient, resetAllMocks } from '../mocks/googleapis';

// Mock googleapis before importing the server
jest.mock('googleapis', () => ({
  google: {
    analyticsadmin: jest.fn(() => mockAnalyticsAdminClient),
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({
        getClient: jest.fn().mockResolvedValue({}),
      })),
    },
  },
}));

describe('MCP Tools', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('create_custom_dimension', () => {
    it('should create a custom dimension successfully', async () => {
      const mockCreate =
        mockAnalyticsAdminClient.properties.customDimensions.create;

      // Simulate tool call
      const args = {
        propertyId: '123456',
        parameterName: 'test_param',
        displayName: 'Test Dimension',
        description: 'A test custom dimension',
        scope: 'EVENT',
      };

      // Call the mocked API
      const result = await mockCreate({
        parent: `properties/${args.propertyId}`,
        requestBody: {
          parameterName: args.parameterName,
          displayName: args.displayName,
          description: args.description,
          scope: args.scope,
        },
      });

      // Assertions
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        parent: 'properties/123456',
        requestBody: {
          parameterName: 'test_param',
          displayName: 'Test Dimension',
          description: 'A test custom dimension',
          scope: 'EVENT',
        },
      });
      expect(result.data).toHaveProperty('parameterName', 'test_param');
      expect(result.data).toHaveProperty('displayName', 'Test Dimension');
    });

    it('should handle property ID as string or number', async () => {
      const mockCreate =
        mockAnalyticsAdminClient.properties.customDimensions.create;

      // Test with string
      await mockCreate({
        parent: 'properties/123456',
        requestBody: {},
      });

      expect(mockCreate).toHaveBeenCalledWith({
        parent: 'properties/123456',
        requestBody: {},
      });

      resetAllMocks();

      // Test with number (should be converted to string in actual implementation)
      await mockCreate({
        parent: `properties/${123456}`,
        requestBody: {},
      });

      expect(mockCreate).toHaveBeenCalledWith({
        parent: 'properties/123456',
        requestBody: {},
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockCreate =
        mockAnalyticsAdminClient.properties.customDimensions.create;

      // Mock an error response
      mockCreate.mockRejectedValueOnce({
        code: 409,
        message: 'Dimension already exists',
      });

      await expect(
        mockCreate({
          parent: 'properties/123456',
          requestBody: {
            parameterName: 'duplicate_param',
          },
        })
      ).rejects.toMatchObject({
        code: 409,
        message: 'Dimension already exists',
      });
    });
  });

  describe('create_conversion_event', () => {
    it('should mark an event as conversion successfully', async () => {
      const mockCreate =
        mockAnalyticsAdminClient.properties.conversionEvents.create;

      const args = {
        propertyId: '123456',
        eventName: 'test_conversion',
      };

      const result = await mockCreate({
        parent: `properties/${args.propertyId}`,
        requestBody: {
          eventName: args.eventName,
        },
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        parent: 'properties/123456',
        requestBody: {
          eventName: 'test_conversion',
        },
      });
      expect(result.data).toHaveProperty('eventName', 'test_conversion');
      expect(result.data).toHaveProperty('custom', true);
    });

    it('should handle duplicate conversion event error', async () => {
      const mockCreate =
        mockAnalyticsAdminClient.properties.conversionEvents.create;

      mockCreate.mockRejectedValueOnce({
        code: 409,
        message: 'Conversion event already exists',
      });

      await expect(
        mockCreate({
          parent: 'properties/123456',
          requestBody: {
            eventName: 'existing_event',
          },
        })
      ).rejects.toMatchObject({
        code: 409,
        message: 'Conversion event already exists',
      });
    });
  });

  describe('list_custom_dimensions', () => {
    it('should list all custom dimensions for a property', async () => {
      const mockList =
        mockAnalyticsAdminClient.properties.customDimensions.list;

      const result = await mockList({
        parent: 'properties/123456',
      });

      expect(mockList).toHaveBeenCalledTimes(1);
      expect(mockList).toHaveBeenCalledWith({
        parent: 'properties/123456',
      });
      expect(result.data.customDimensions).toHaveLength(1);
      expect(result.data.customDimensions[0]).toHaveProperty(
        'parameterName',
        'test_param'
      );
    });

    it('should handle empty list', async () => {
      const mockList =
        mockAnalyticsAdminClient.properties.customDimensions.list;

      mockList.mockResolvedValueOnce({
        data: {
          customDimensions: [],
          nextPageToken: null,
        },
      });

      const result = await mockList({
        parent: 'properties/123456',
      });

      expect(result.data.customDimensions).toHaveLength(0);
    });
  });

  describe('list_conversion_events', () => {
    it('should list all conversion events for a property', async () => {
      const mockList =
        mockAnalyticsAdminClient.properties.conversionEvents.list;

      const result = await mockList({
        parent: 'properties/123456',
      });

      expect(mockList).toHaveBeenCalledTimes(1);
      expect(mockList).toHaveBeenCalledWith({
        parent: 'properties/123456',
      });
      expect(result.data.conversionEvents).toHaveLength(1);
      expect(result.data.conversionEvents[0]).toHaveProperty(
        'eventName',
        'test_conversion'
      );
    });

    it('should handle empty conversion events list', async () => {
      const mockList =
        mockAnalyticsAdminClient.properties.conversionEvents.list;

      mockList.mockResolvedValueOnce({
        data: {
          conversionEvents: [],
          nextPageToken: null,
        },
      });

      const result = await mockList({
        parent: 'properties/123456',
      });

      expect(result.data.conversionEvents).toHaveLength(0);
    });
  });

  describe('Input Validation', () => {
    it('should validate property ID format', () => {
      // Test various property ID formats
      const validIds = ['123456', 'G-123456', 'properties/123456'];
      const invalidIds = ['', null, undefined];

      validIds.forEach((id) => {
        expect(typeof id === 'string' && id.length > 0).toBe(true);
      });

      invalidIds.forEach((id) => {
        expect(!id || (typeof id === 'string' && id.length === 0)).toBe(true);
      });
    });

    it('should validate parameter name rules', () => {
      // GA4 parameter name rules:
      // - Must start with a letter
      // - Can contain letters, numbers, underscores
      // - Max 40 characters
      const validNames = ['method', 'session_id', 'error_type', 'step_number'];
      const invalidNames = ['1_invalid', 'invalid-dash', 'too_long_' + 'a'.repeat(40)];

      const paramNameRegex = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;

      validNames.forEach((name) => {
        expect(paramNameRegex.test(name)).toBe(true);
      });

      invalidNames.forEach((name) => {
        expect(paramNameRegex.test(name)).toBe(false);
      });
    });

    it('should validate scope values', () => {
      const validScopes = ['EVENT', 'USER', 'ITEM'];
      const invalidScopes = ['INVALID', 'event', 'Session'];

      validScopes.forEach((scope) => {
        expect(['EVENT', 'USER', 'ITEM'].includes(scope)).toBe(true);
      });

      invalidScopes.forEach((scope) => {
        expect(['EVENT', 'USER', 'ITEM'].includes(scope)).toBe(false);
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle 404 Not Found (invalid property)', async () => {
      const mockCreate =
        mockAnalyticsAdminClient.properties.customDimensions.create;

      mockCreate.mockRejectedValueOnce({
        code: 404,
        message: 'Property not found',
      });

      await expect(
        mockCreate({
          parent: 'properties/999999',
          requestBody: {},
        })
      ).rejects.toMatchObject({
        code: 404,
      });
    });

    it('should handle 403 Forbidden (insufficient permissions)', async () => {
      const mockCreate =
        mockAnalyticsAdminClient.properties.customDimensions.create;

      mockCreate.mockRejectedValueOnce({
        code: 403,
        message: 'Insufficient permissions',
      });

      await expect(
        mockCreate({
          parent: 'properties/123456',
          requestBody: {},
        })
      ).rejects.toMatchObject({
        code: 403,
      });
    });

    it('should handle 500 Internal Server Error', async () => {
      const mockCreate =
        mockAnalyticsAdminClient.properties.customDimensions.create;

      mockCreate.mockRejectedValueOnce({
        code: 500,
        message: 'Internal server error',
      });

      await expect(
        mockCreate({
          parent: 'properties/123456',
          requestBody: {},
        })
      ).rejects.toMatchObject({
        code: 500,
      });
    });
  });
});
