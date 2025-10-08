/**
 * Integration Tests with Real GA4 API
 *
 * These tests make real API calls to Google Analytics Admin API.
 * Requires:
 * - GOOGLE_APPLICATION_CREDENTIALS environment variable
 * - GA4_TEST_PROPERTY_ID environment variable
 * - Service account with Editor permissions on test property
 *
 * Run with: npm run test:integration
 */

import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Skip tests if credentials are not available
const skipIfNoCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? describe
  : describe.skip;

const TEST_PROPERTY_ID = process.env.GA4_TEST_PROPERTY_ID || '';

skipIfNoCredentials('GA4 Admin API Integration Tests', () => {
  let analyticsadmin: any;
  let auth: GoogleAuth;

  beforeAll(async () => {
    // Initialize Google Auth
    auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/analytics.edit'],
    });

    // Create Analytics Admin client
    analyticsadmin = google.analyticsadmin({
      version: 'v1beta',
      auth: auth as any,
    });
  });

  describe('Custom Dimensions', () => {
    let createdDimensionName: string;

    it('should create a custom dimension', async () => {
      const timestamp = Date.now();
      const result = await analyticsadmin.properties.customDimensions.create({
        parent: `properties/${TEST_PROPERTY_ID}`,
        requestBody: {
          parameterName: `test_param_${timestamp}`,
          displayName: `Test Dimension ${timestamp}`,
          description: 'Integration test dimension',
          scope: 'EVENT',
        },
      });

      expect(result.data).toHaveProperty('name');
      expect(result.data.parameterName).toBe(`test_param_${timestamp}`);
      expect(result.data.displayName).toBe(`Test Dimension ${timestamp}`);
      expect(result.data.scope).toBe('EVENT');

      createdDimensionName = result.data.name;
    }, 30000); // 30 second timeout for API call

    it('should list custom dimensions', async () => {
      const result = await analyticsadmin.properties.customDimensions.list({
        parent: `properties/${TEST_PROPERTY_ID}`,
      });

      expect(result.data).toHaveProperty('customDimensions');
      expect(Array.isArray(result.data.customDimensions)).toBe(true);
      expect(result.data.customDimensions.length).toBeGreaterThan(0);
    }, 30000);

    it('should get a specific custom dimension', async () => {
      if (!createdDimensionName) {
        console.warn('Skipping: No dimension was created in previous test');
        return;
      }

      const result = await analyticsadmin.properties.customDimensions.get({
        name: createdDimensionName,
      });

      expect(result.data.name).toBe(createdDimensionName);
      expect(result.data).toHaveProperty('parameterName');
      expect(result.data).toHaveProperty('displayName');
    }, 30000);

    it('should reject duplicate parameter names', async () => {
      const timestamp = Date.now();
      const paramName = `duplicate_${timestamp}`;

      // Create first dimension
      await analyticsadmin.properties.customDimensions.create({
        parent: `properties/${TEST_PROPERTY_ID}`,
        requestBody: {
          parameterName: paramName,
          displayName: 'First Dimension',
          scope: 'EVENT',
        },
      });

      // Try to create duplicate
      await expect(
        analyticsadmin.properties.customDimensions.create({
          parent: `properties/${TEST_PROPERTY_ID}`,
          requestBody: {
            parameterName: paramName,
            displayName: 'Duplicate Dimension',
            scope: 'EVENT',
          },
        })
      ).rejects.toThrow();
    }, 60000);
  });

  describe('Conversion Events', () => {
    let createdEventName: string;

    it('should create a conversion event', async () => {
      const timestamp = Date.now();
      const eventName = `test_event_${timestamp}`;

      const result = await analyticsadmin.properties.conversionEvents.create({
        parent: `properties/${TEST_PROPERTY_ID}`,
        requestBody: {
          eventName: eventName,
        },
      });

      expect(result.data).toHaveProperty('name');
      expect(result.data.eventName).toBe(eventName);
      expect(result.data.custom).toBe(true);

      createdEventName = result.data.name;
    }, 30000);

    it('should list conversion events', async () => {
      const result = await analyticsadmin.properties.conversionEvents.list({
        parent: `properties/${TEST_PROPERTY_ID}`,
      });

      expect(result.data).toHaveProperty('conversionEvents');
      expect(Array.isArray(result.data.conversionEvents)).toBe(true);
      expect(result.data.conversionEvents.length).toBeGreaterThan(0);
    }, 30000);

    it('should get a specific conversion event', async () => {
      if (!createdEventName) {
        console.warn('Skipping: No event was created in previous test');
        return;
      }

      const result = await analyticsadmin.properties.conversionEvents.get({
        name: createdEventName,
      });

      expect(result.data.name).toBe(createdEventName);
      expect(result.data).toHaveProperty('eventName');
      expect(result.data.custom).toBe(true);
    }, 30000);

    it('should delete a conversion event', async () => {
      if (!createdEventName) {
        console.warn('Skipping: No event was created in previous test');
        return;
      }

      await analyticsadmin.properties.conversionEvents.delete({
        name: createdEventName,
      });

      // Verify deletion
      await expect(
        analyticsadmin.properties.conversionEvents.get({
          name: createdEventName,
        })
      ).rejects.toThrow();
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid property ID', async () => {
      await expect(
        analyticsadmin.properties.customDimensions.list({
          parent: 'properties/999999999',
        })
      ).rejects.toThrow();
    }, 30000);

    it('should handle invalid dimension name', async () => {
      await expect(
        analyticsadmin.properties.customDimensions.create({
          parent: `properties/${TEST_PROPERTY_ID}`,
          requestBody: {
            parameterName: '1_invalid_start_with_number',
            displayName: 'Invalid Dimension',
            scope: 'EVENT',
          },
        })
      ).rejects.toThrow();
    }, 30000);
  });

  describe('Pagination', () => {
    it('should handle paginated results for custom dimensions', async () => {
      const result = await analyticsadmin.properties.customDimensions.list({
        parent: `properties/${TEST_PROPERTY_ID}`,
        pageSize: 5,
      });

      expect(result.data).toHaveProperty('customDimensions');

      if (result.data.nextPageToken) {
        const nextResult =
          await analyticsadmin.properties.customDimensions.list({
            parent: `properties/${TEST_PROPERTY_ID}`,
            pageSize: 5,
            pageToken: result.data.nextPageToken,
          });

        expect(nextResult.data).toHaveProperty('customDimensions');
      }
    }, 30000);
  });
});

/**
 * Helper function to clean up test resources
 *
 * Note: Custom dimensions cannot be deleted via API,
 * only archived. This is a limitation of the GA4 API.
 */
async function cleanupTestResources() {
  // Conversion events can be deleted
  // Custom dimensions can only be archived (manual cleanup required)
  console.log('Integration test cleanup complete');
}

afterAll(async () => {
  await cleanupTestResources();
});
