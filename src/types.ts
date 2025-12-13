/**
 * @fileoverview Shared TypeScript interfaces and type definitions for the Earth Engine wrapper.
 *
 * This module provides strongly-typed interfaces for common Earth Engine operations,
 * while relying on the runtime types from the official @google/earthengine package.
 */

import type ee from '@google/earthengine';

// =============================================================================
// Earth Engine Object Type Aliases
// =============================================================================

/**
 * Type alias for Earth Engine Image objects.
 * Uses the runtime type from the official package.
 */
export type EEImage = ReturnType<typeof ee.Image>;

/**
 * Type alias for Earth Engine ImageCollection objects.
 */
export type EEImageCollection = ReturnType<typeof ee.ImageCollection>;

/**
 * Type alias for Earth Engine Geometry objects.
 */
export type EEGeometry = ReturnType<typeof ee.Geometry.Point>;

/**
 * Type alias for Earth Engine Feature objects.
 */
export type EEFeature = ReturnType<typeof ee.Feature>;

/**
 * Type alias for Earth Engine FeatureCollection objects.
 */
export type EEFeatureCollection = ReturnType<typeof ee.FeatureCollection>;

/**
 * Type alias for Earth Engine Reducer objects.
 */
export type EEReducer = ReturnType<typeof ee.Reducer.mean>;

/**
 * Type alias for Earth Engine Number objects.
 */
export type EENumber = ReturnType<typeof ee.Number>;

/**
 * Type alias for Earth Engine String objects.
 */
export type EEString = ReturnType<typeof ee.String>;

/**
 * Type alias for Earth Engine List objects.
 */
export type EEList = ReturnType<typeof ee.List>;

/**
 * Type alias for Earth Engine Dictionary objects.
 */
export type EEDictionary = ReturnType<typeof ee.Dictionary>;

/**
 * Type alias for Earth Engine Date objects.
 */
export type EEDate = ReturnType<typeof ee.Date>;

// =============================================================================
// Initialization Options
// =============================================================================

/**
 * Service account credentials for Earth Engine authentication.
 */
export interface ServiceAccountCredentials {
  /** The service account email (client_email from JSON key). */
  email: string;
  /** The private key (private_key from JSON key). */
  privateKey: string;
}

/**
 * Options for initializing the Earth Engine client.
 */
export interface EarthEngineInitOptions {
  /**
   * Service account JSON key as a string or parsed object.
   * Use this for server-side authentication.
   */
  privateKeyJson?: string | ServiceAccountCredentials;

  /**
   * Custom token retriever function for advanced authentication scenarios.
   * Should return a valid access token.
   */
  tokenRetriever?: () => Promise<string>;

  /**
   * Google Cloud project ID for Earth Engine API calls.
   * Required for some operations and recommended for all.
   */
  project?: string;

  /**
   * Base URL for the Earth Engine API.
   * Defaults to the standard Earth Engine endpoint.
   */
  baseUrl?: string;
}

/**
 * Options for OAuth-based authentication (browser environments).
 */
export interface OAuthOptions {
  /** OAuth client ID from Google Cloud Console. */
  clientId: string;

  /** OAuth scopes to request. Defaults to Earth Engine scope. */
  scopes?: string[];

  /** Google Cloud project ID. */
  project?: string;
}

// =============================================================================
// Common Operation Interfaces
// =============================================================================

/**
 * Represents a time range for filtering collections.
 */
export interface TimeRange {
  /** Start date in ISO 8601 format (e.g., '2020-01-01'). */
  start: string;
  /** End date in ISO 8601 format (e.g., '2020-12-31'). */
  end: string;
}

/**
 * Bounding box coordinates [west, south, east, north].
 */
export type BoundingBox = [west: number, south: number, east: number, north: number];

/**
 * Point coordinates [longitude, latitude].
 */
export type PointCoordinates = [longitude: number, latitude: number];

/**
 * Polygon coordinates as an array of rings, where each ring is an array of [lon, lat] pairs.
 */
export type PolygonCoordinates = Array<Array<PointCoordinates>>;

// =============================================================================
// Export Options
// =============================================================================

/**
 * Base options for all export tasks.
 */
export interface BaseExportOptions {
  /** Description/name of the export task. */
  description: string;

  /** Scale in meters per pixel. */
  scale?: number;

  /** CRS to use for the export (e.g., 'EPSG:4326'). */
  crs?: string;

  /** Maximum number of pixels to export. */
  maxPixels?: number;

  /** Region to export as Earth Engine geometry. */
  region?: EEGeometry;
}

/**
 * Options for exporting images to Google Drive.
 */
export interface DriveExportOptions extends BaseExportOptions {
  /** Folder in Drive to export to. */
  folder?: string;

  /** File format: 'GeoTIFF', 'TFRecord'. */
  fileFormat?: 'GeoTIFF' | 'TFRecord';

  /** Additional format-specific options. */
  formatOptions?: Record<string, unknown>;
}

/**
 * Options for exporting images to Google Cloud Storage.
 */
export interface CloudStorageExportOptions extends BaseExportOptions {
  /** Cloud Storage bucket name. */
  bucket: string;

  /** File prefix/path within the bucket. */
  fileNamePrefix?: string;

  /** File format: 'GeoTIFF', 'TFRecord'. */
  fileFormat?: 'GeoTIFF' | 'TFRecord';

  /** Additional format-specific options. */
  formatOptions?: Record<string, unknown>;
}

/**
 * Options for exporting tables to Google Drive.
 */
export interface TableDriveExportOptions {
  /** Description/name of the export task. */
  description: string;

  /** Folder in Drive to export to. */
  folder?: string;

  /** File format: 'CSV', 'GeoJSON', 'KML', 'KMZ', 'SHP'. */
  fileFormat?: 'CSV' | 'GeoJSON' | 'KML' | 'KMZ' | 'SHP';

  /** Columns to include (defaults to all). */
  selectors?: string[];
}

/**
 * Options for exporting tables to Cloud Storage.
 */
export interface TableCloudStorageExportOptions {
  /** Description/name of the export task. */
  description: string;

  /** Cloud Storage bucket name. */
  bucket: string;

  /** File prefix/path within the bucket. */
  fileNamePrefix?: string;

  /** File format: 'CSV', 'GeoJSON', 'KML', 'KMZ', 'SHP', 'TFRecord'. */
  fileFormat?: 'CSV' | 'GeoJSON' | 'KML' | 'KMZ' | 'SHP' | 'TFRecord';

  /** Columns to include (defaults to all). */
  selectors?: string[];
}

// =============================================================================
// Callback Types
// =============================================================================

/**
 * Callback function for mapping over image collections.
 */
export type ImageMapCallback = (image: EEImage) => EEImage;

/**
 * Callback function for mapping over feature collections.
 */
export type FeatureMapCallback = (feature: EEFeature) => EEFeature;

/**
 * Callback function for filtering collections.
 */
export type FilterCallback<T> = (element: T) => boolean;

