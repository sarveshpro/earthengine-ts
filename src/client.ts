/**
 * @fileoverview Earth Engine client initialization and authentication utilities.
 *
 * This module provides a thin wrapper around the official @google/earthengine
 * initialization and authentication methods, adding TypeScript type safety
 * and a more ergonomic async API.
 *
 * @example
 * ```typescript
 * import { initEarthEngine, ee } from '@planet/earthengine-ts';
 *
 * // Initialize with service account
 * await initEarthEngine({
 *   privateKeyJson: require('./service-account.json'),
 *   project: 'my-gcp-project',
 * });
 *
 * // Now use ee as normal
 * const image = ee.Image('USGS/SRTMGL1_003');
 * ```
 */

import ee from '@google/earthengine';
import type {
  EarthEngineInitOptions,
  OAuthOptions,
  ServiceAccountCredentials,
} from './types.js';

/** Default Earth Engine OAuth scope. */
const DEFAULT_SCOPES = ['https://www.googleapis.com/auth/earthengine'];

/**
 * Parses a service account key from string or object format.
 * Extracts email, privateKey, and projectId from the JSON.
 */
function parseServiceAccountKey(
  keyInput: string | ServiceAccountCredentials
): ServiceAccountCredentials {
  if (typeof keyInput === 'string') {
    try {
      const parsed = JSON.parse(keyInput) as Record<string, unknown>;
      return {
        email: parsed.client_email as string,
        privateKey: parsed.private_key as string,
        projectId: parsed.project_id as string | undefined,
      };
    } catch {
      throw new Error('Failed to parse service account JSON key');
    }
  }
  return keyInput;
}

/**
 * Initializes the Earth Engine client with the provided options.
 *
 * This is a thin wrapper around the official ee.data.authenticateViaPrivateKey
 * and ee.initialize methods, providing a Promise-based API and TypeScript types.
 *
 * @param options - Configuration options for initialization.
 * @returns A promise that resolves to the initialized ee object.
 *
 * @example
 * ```typescript
 * // Service account authentication with JSON string
 * const client = await initEarthEngine({
 *   privateKeyJson: fs.readFileSync('./key.json', 'utf-8'),
 *   project: 'my-project',
 * });
 *
 * // Service account authentication with separate email and privateKey
 * const client = await initEarthEngine({
 *   email: 'service-account@project.iam.gserviceaccount.com',
 *   privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
 *   project: 'my-project',
 * });
 *
 * // Custom token retriever
 * const client = await initEarthEngine({
 *   tokenRetriever: async () => await getTokenFromVault(),
 *   project: 'my-project',
 * });
 * ```
 */
export async function initEarthEngine(
  options: EarthEngineInitOptions = {}
): Promise<typeof ee> {
  const { privateKeyJson, email, privateKey, tokenRetriever, project, baseUrl } = options;

  // Authenticate based on provided credentials
  // Priority: 1. separate email/privateKey, 2. privateKeyJson, 3. tokenRetriever
  if (email && privateKey) {
    const credentials: { client_email: string; private_key: string; project_id?: string } = {
      client_email: email,
      private_key: privateKey,
    };
    if (project && typeof project === 'string') {
      credentials.project_id = project.trim();
    }
    await new Promise<void>((resolve, reject) => {
      ee.data.authenticateViaPrivateKey(
        credentials,
        () => resolve(),
        (error: Error) => reject(error)
      );
    });
  } else if (privateKeyJson) {
    const parsedCredentials = parseServiceAccountKey(privateKeyJson);
    const credentials: { client_email: string; private_key: string; project_id?: string } = {
      client_email: parsedCredentials.email,
      private_key: parsedCredentials.privateKey,
    };
    if (project && typeof project === 'string') {
      credentials.project_id = project.trim();
    } else if (parsedCredentials.projectId) {
      credentials.project_id = parsedCredentials.projectId;
    }
    await new Promise<void>((resolve, reject) => {
      ee.data.authenticateViaPrivateKey(
        credentials,
        () => resolve(),
        (error: Error) => reject(error)
      );
    });
  } else if (tokenRetriever) {
    const token = await tokenRetriever();
    ee.data.setAuthToken('', 'Bearer', token, 3600, [], undefined, false);
  }

  // Initialize the Earth Engine API
  await new Promise<void>((resolve, reject) => {
    let projectValue: string | null = null;
    if (project) {
      if (typeof project !== 'string') {
        return reject(new Error(`Project must be a string, got ${typeof project}`));
      }
      projectValue = project.trim() || null;
    }

    const baseUrlValue = baseUrl ? String(baseUrl).trim() : null;

    ee.initialize(
      baseUrlValue,
      null,
      () => resolve(),
      (error: Error) => reject(error),
      null,
      projectValue
    );
  });

  return ee;
}

/**
 * Initializes Earth Engine with OAuth authentication.
 *
 * This is primarily intended for browser environments where users
 * authenticate via Google's OAuth flow.
 *
 * @param options - OAuth configuration options.
 * @returns A promise that resolves to the initialized ee object.
 *
 * @example
 * ```typescript
 * // Browser-based OAuth
 * const client = await initWithOAuth({
 *   clientId: 'your-client-id.apps.googleusercontent.com',
 *   project: 'my-project',
 * });
 * ```
 */
export async function initWithOAuth(options: OAuthOptions): Promise<typeof ee> {
  const { clientId, scopes = DEFAULT_SCOPES, project } = options;

  // Authenticate via OAuth
  await new Promise<void>((resolve, reject) => {
    ee.data.authenticateViaOauth(
      clientId,
      () => resolve(),
      (error: Error) => reject(error),
      scopes,
      null
    );
  });

  // Initialize the Earth Engine API
  await new Promise<void>((resolve, reject) => {
    const projectValue = project && typeof project === 'string' ? project.trim() : null;

    ee.initialize(
      null,
      null,
      () => resolve(),
      (error: Error) => reject(error),
      null,
      projectValue
    );
  });

  return ee;
}

/**
 * Checks if the Earth Engine client is already initialized.
 *
 * @returns True if initialized, false otherwise.
 */
export function isInitialized(): boolean {
  try {
    // Attempt to check the initialization state
    // This is a heuristic as the official API doesn't expose a direct method
    return typeof ee.data.getApiBaseUrl === 'function' && ee.data.getApiBaseUrl() !== null;
  } catch {
    return false;
  }
}

/**
 * Resets the Earth Engine client state.
 *
 * Useful for testing or reinitializing with different credentials.
 */
export function resetClient(): void {
  ee.reset();
}

// Re-export the ee object for direct access
export { ee };

// Export the default ee object for convenient default imports
export default ee;

