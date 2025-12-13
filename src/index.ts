/**
 * @fileoverview Main entry point for @planet/earthengine-ts.
 *
 * This is an unofficial TypeScript wrapper around the official Google Earth Engine
 * JavaScript client (@google/earthengine). It provides typed initialization helpers
 * and ergonomic utilities for common Earth Engine operations.
 *
 * @remarks
 * - This is NOT an official Google product.
 * - Earth Engine and the official JS client are developed and owned by Google.
 * - Users must comply with the Google Earth Engine Terms of Service.
 * - The underlying @google/earthengine package is licensed under Apache-2.0.
 *
 * @see https://earthengine.google.com/terms/
 * @see https://developers.google.com/earth-engine/reference/Additional.API.Terms
 *
 * @example
 * ```typescript
 * import { initEarthEngine, ee, imageHelpers, geometryHelpers } from '@planet/earthengine-ts';
 *
 * // Initialize with service account
 * await initEarthEngine({
 *   privateKeyJson: require('./service-account.json'),
 *   project: 'my-gcp-project',
 * });
 *
 * // Use typed helpers
 * const point = geometryHelpers.createPoint(-122.4194, 37.7749);
 * const collection = imageHelpers.loadImageCollection(
 *   'LANDSAT/LC08/C02/T1_L2',
 *   point,
 *   { start: '2020-01-01', end: '2020-12-31' }
 * );
 *
 * // Or use ee directly
 * const image = ee.Image('USGS/SRTMGL1_003');
 * ```
 *
 * @packageDocumentation
 */

// =============================================================================
// Client exports
// =============================================================================

export {
  initEarthEngine,
  initWithOAuth,
  isInitialized,
  resetClient,
  ee,
} from './client.js';

// Export ee as default for convenience
export { default } from './client.js';

// =============================================================================
// Type exports
// =============================================================================

export type {
  // Earth Engine object types
  EEImage,
  EEImageCollection,
  EEGeometry,
  EEFeature,
  EEFeatureCollection,
  EEReducer,
  EENumber,
  EEString,
  EEList,
  EEDictionary,
  EEDate,
  // Initialization types
  EarthEngineInitOptions,
  OAuthOptions,
  ServiceAccountCredentials,
  // Common types
  TimeRange,
  BoundingBox,
  PointCoordinates,
  PolygonCoordinates,
  // Export types
  BaseExportOptions,
  DriveExportOptions,
  CloudStorageExportOptions,
  TableDriveExportOptions,
  TableCloudStorageExportOptions,
  // Callback types
  ImageMapCallback,
  FeatureMapCallback,
  FilterCallback,
} from './types.js';

// =============================================================================
// Helper modules (namespaced exports)
// =============================================================================

export * as imageHelpers from './helpers/images.js';
export * as geometryHelpers from './helpers/geometry.js';
export * as exportHelpers from './helpers/exports.js';

// =============================================================================
// Direct helper exports (for tree-shaking)
// =============================================================================

export {
  // Image helpers
  loadImageCollection,
  loadImage,
  mapCollection,
  compositeCollection,
  filterByCloudCover,
  selectBands,
  calculateNDVI,
  clipImage,
  clipCollection,
  getCollectionSize,
  collectionToList,
} from './helpers/images.js';

export {
  // Geometry helpers
  createPoint,
  createPointFromCoords,
  createRectangle,
  createPolygon,
  createLineString,
  createMultiPoint,
  bufferGeometry,
  centroid,
  bounds,
  area,
  union,
  intersection,
  difference,
  createFeature,
  createFeatureCollection,
  featureCollectionFromGeometries,
} from './helpers/geometry.js';

export {
  // Export helpers
  exportImageToDrive,
  exportImageToCloudStorage,
  exportTableToDrive,
  exportTableToCloudStorage,
  exportImageToAsset,
  exportTableToAsset,
  startTasks,
} from './helpers/exports.js';

export type { ExportTask, TaskStatus } from './helpers/exports.js';

