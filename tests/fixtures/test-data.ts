/**
 * Test Fixtures
 *
 * Common test data used across unit and integration tests.
 */

export const TEST_PROPERTY_ID = '123456';

export const TEST_CUSTOM_DIMENSIONS = [
  {
    parameterName: 'method',
    displayName: '登入方式',
    description: '使用者的登入/註冊方式',
    scope: 'EVENT' as const,
  },
  {
    parameterName: 'session_id',
    displayName: 'Session ID',
    description: 'Coaching session identifier',
    scope: 'EVENT' as const,
  },
  {
    parameterName: 'error_type',
    displayName: '錯誤類型',
    description: '錯誤訊息分類',
    scope: 'EVENT' as const,
  },
  {
    parameterName: 'step',
    displayName: '快速開始步驟',
    description: 'Onboarding funnel step number',
    scope: 'EVENT' as const,
  },
];

export const TEST_CONVERSION_EVENTS = [
  'user_signup_complete',
  'session_create_complete',
  'audio_upload_complete',
  'transcript_view',
];

export const VALID_PARAMETER_NAMES = [
  'method',
  'session_id',
  'error_type',
  'step_number',
  'user_action',
];

export const INVALID_PARAMETER_NAMES = [
  '1_starts_with_number',
  'has-dash',
  'has space',
  'too_long_' + 'a'.repeat(50),
  '',
];

export const VALID_SCOPES = ['EVENT', 'USER', 'ITEM'] as const;

export const INVALID_SCOPES = ['INVALID', 'event', 'Session', ''];

export const API_ERROR_RESPONSES = {
  notFound: {
    code: 404,
    message: 'Requested entity was not found',
    status: 'NOT_FOUND',
  },
  forbidden: {
    code: 403,
    message: 'User does not have sufficient permissions',
    status: 'PERMISSION_DENIED',
  },
  alreadyExists: {
    code: 409,
    message: 'Resource already exists',
    status: 'ALREADY_EXISTS',
  },
  invalidArgument: {
    code: 400,
    message: 'Invalid argument provided',
    status: 'INVALID_ARGUMENT',
  },
  internal: {
    code: 500,
    message: 'Internal server error',
    status: 'INTERNAL',
  },
};

export const MOCK_CUSTOM_DIMENSION_RESPONSE = {
  name: `properties/${TEST_PROPERTY_ID}/customDimensions/1`,
  parameterName: 'test_param',
  displayName: 'Test Dimension',
  description: 'A test custom dimension',
  scope: 'EVENT',
  disallowAdsPersonalization: false,
};

export const MOCK_CONVERSION_EVENT_RESPONSE = {
  name: `properties/${TEST_PROPERTY_ID}/conversionEvents/1`,
  eventName: 'test_conversion',
  createTime: '2025-10-07T00:00:00Z',
  deletable: true,
  custom: true,
};
