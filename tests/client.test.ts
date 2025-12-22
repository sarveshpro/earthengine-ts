/**
 * @fileoverview Tests for the Earth Engine client initialization utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the @google/earthengine module
vi.mock('@google/earthengine', () => {
  const mockEe = {
    data: {
      authenticateViaPrivateKey: vi.fn(),
      authenticateViaOauth: vi.fn(),
      setAuthToken: vi.fn(),
      getApiBaseUrl: vi.fn(() => 'https://earthengine.googleapis.com'),
    },
    initialize: vi.fn(),
    reset: vi.fn(),
    Image: vi.fn(),
    ImageCollection: vi.fn(),
    Geometry: {
      Point: vi.fn(),
      Rectangle: vi.fn(),
      Polygon: vi.fn(),
    },
  };
  return { default: mockEe };
});

import { initEarthEngine, initWithOAuth, isInitialized, resetClient, ee } from '../src/client.js';

describe('initEarthEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with service account JSON object', async () => {
    // Setup mocks to call success callbacks
    vi.mocked(ee.data.authenticateViaPrivateKey).mockImplementation(
      (_credentials, success, _error) => {
        success();
      }
    );
    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, success, _error, _c, _d) => {
        success();
      }
    );

    const result = await initEarthEngine({
      privateKeyJson: {
        email: 'test@example.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
      },
      project: 'test-project',
    });

    expect(result).toBe(ee);
    expect(ee.data.authenticateViaPrivateKey).toHaveBeenCalledTimes(1);
    expect(ee.initialize).toHaveBeenCalledTimes(1);
  });

  it('should initialize with service account JSON string', async () => {
    const jsonKey = JSON.stringify({
      client_email: 'test@example.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
    });

    vi.mocked(ee.data.authenticateViaPrivateKey).mockImplementation(
      (_credentials, success, _error) => {
        success();
      }
    );
    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, success, _error, _c, _d) => {
        success();
      }
    );

    const result = await initEarthEngine({
      privateKeyJson: jsonKey,
      project: 'test-project',
    });

    expect(result).toBe(ee);
    expect(ee.data.authenticateViaPrivateKey).toHaveBeenCalledWith(
      expect.objectContaining({
        client_email: 'test@example.iam.gserviceaccount.com',
      }),
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('should initialize with separate email and privateKey', async () => {
    vi.mocked(ee.data.authenticateViaPrivateKey).mockImplementation(
      (_credentials, success, _error) => {
        success();
      }
    );
    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, success, _error, _c, _d) => {
        success();
      }
    );

    const result = await initEarthEngine({
      email: 'test@example.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
      project: 'test-project',
    });

    expect(result).toBe(ee);
    expect(ee.data.authenticateViaPrivateKey).toHaveBeenCalledWith(
      {
        client_email: 'test@example.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
        project_id: 'test-project',
      },
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('should prioritize separate email/privateKey over privateKeyJson', async () => {
    vi.mocked(ee.data.authenticateViaPrivateKey).mockImplementation(
      (_credentials, success, _error) => {
        success();
      }
    );
    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, success, _error, _c, _d) => {
        success();
      }
    );

    await initEarthEngine({
      email: 'separate@example.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nSEPARATE\n-----END PRIVATE KEY-----',
      privateKeyJson: JSON.stringify({
        client_email: 'json@example.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nJSON\n-----END PRIVATE KEY-----',
      }),
      project: 'test-project',
    });

    // Should use the separate email/privateKey, not the JSON
    expect(ee.data.authenticateViaPrivateKey).toHaveBeenCalledWith(
      {
        client_email: 'separate@example.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nSEPARATE\n-----END PRIVATE KEY-----',
        project_id: 'test-project',
      },
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('should initialize with custom token retriever', async () => {
    const mockToken = 'mock-access-token';
    const tokenRetriever = vi.fn().mockResolvedValue(mockToken);

    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, success, _error, _c, _d) => {
        success();
      }
    );

    await initEarthEngine({
      tokenRetriever,
      project: 'test-project',
    });

    expect(tokenRetriever).toHaveBeenCalled();
    expect(ee.data.setAuthToken).toHaveBeenCalledWith(
      '',
      'Bearer',
      mockToken,
      3600,
      [],
      undefined,
      false
    );
    expect(ee.initialize).toHaveBeenCalled();
  });

  it('should initialize without any credentials (external auth)', async () => {
    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, success, _error, _c, _d) => {
        success();
      }
    );

    await initEarthEngine({});

    expect(ee.data.authenticateViaPrivateKey).not.toHaveBeenCalled();
    expect(ee.data.setAuthToken).not.toHaveBeenCalled();
    expect(ee.initialize).toHaveBeenCalled();
  });

  it('should throw error on invalid JSON key string', async () => {
    await expect(
      initEarthEngine({
        privateKeyJson: 'not-valid-json',
      })
    ).rejects.toThrow('Failed to parse service account JSON key');
  });

  it('should reject on authentication failure', async () => {
    vi.mocked(ee.data.authenticateViaPrivateKey).mockImplementation(
      (_credentials, _success, error) => {
        error(new Error('Authentication failed'));
      }
    );

    await expect(
      initEarthEngine({
        privateKeyJson: {
          email: 'test@example.iam.gserviceaccount.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
        },
      })
    ).rejects.toThrow('Authentication failed');
  });

  it('should reject on initialization failure', async () => {
    vi.mocked(ee.data.authenticateViaPrivateKey).mockImplementation(
      (_credentials, success, _error) => {
        success();
      }
    );
    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, _success, error, _c, _d) => {
        error(new Error('Initialization failed'));
      }
    );

    await expect(
      initEarthEngine({
        privateKeyJson: {
          email: 'test@example.iam.gserviceaccount.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
        },
      })
    ).rejects.toThrow('Initialization failed');
  });
});

describe('initWithOAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with OAuth credentials', async () => {
    vi.mocked(ee.data.authenticateViaOauth).mockImplementation(
      (_clientId, success, _error, _scopes, _extra) => {
        success();
      }
    );
    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, success, _error, _c, _d) => {
        success();
      }
    );

    const result = await initWithOAuth({
      clientId: 'test-client-id.apps.googleusercontent.com',
      project: 'test-project',
    });

    expect(result).toBe(ee);
    expect(ee.data.authenticateViaOauth).toHaveBeenCalledWith(
      'test-client-id.apps.googleusercontent.com',
      expect.any(Function),
      expect.any(Function),
      ['https://www.googleapis.com/auth/earthengine'],
      null
    );
  });

  it('should use custom scopes when provided', async () => {
    vi.mocked(ee.data.authenticateViaOauth).mockImplementation(
      (_clientId, success, _error, _scopes, _extra) => {
        success();
      }
    );
    vi.mocked(ee.initialize).mockImplementation(
      (_a, _b, success, _error, _c, _d) => {
        success();
      }
    );

    await initWithOAuth({
      clientId: 'test-client-id.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/earthengine.readonly'],
    });

    expect(ee.data.authenticateViaOauth).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
      expect.any(Function),
      ['https://www.googleapis.com/auth/earthengine.readonly'],
      null
    );
  });
});

describe('isInitialized', () => {
  it('should return true when getApiBaseUrl returns a value', () => {
    vi.mocked(ee.data.getApiBaseUrl).mockReturnValue('https://earthengine.googleapis.com');
    expect(isInitialized()).toBe(true);
  });

  it('should return false when getApiBaseUrl returns null', () => {
    vi.mocked(ee.data.getApiBaseUrl).mockReturnValue(null);
    expect(isInitialized()).toBe(false);
  });

  it('should return false when getApiBaseUrl throws', () => {
    vi.mocked(ee.data.getApiBaseUrl).mockImplementation(() => {
      throw new Error('Not initialized');
    });
    expect(isInitialized()).toBe(false);
  });
});

describe('resetClient', () => {
  it('should call ee.reset', () => {
    resetClient();
    expect(ee.reset).toHaveBeenCalledTimes(1);
  });
});

