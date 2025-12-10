/**
 * Mock configuration constants for development and testing.
 * These values should match the format of real data from the authentication service.
 */
export const MOCK_CONFIG = {
  /**
   * Mock user ID in UUID format, matching Keycloak's token subject claim format.
   * This ensures consistency when switching between mock and real authentication.
   */
  userId: '550e8400-e29b-41d4-a716-446655440000',
  
  /**
   * Mock device identifier for health data measurements.
   */
  deviceId: 'mock-device',
} as const;
