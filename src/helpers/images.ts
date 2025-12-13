/**
 * @fileoverview Image and ImageCollection helper functions.
 *
 * This module provides typed helper functions for common Earth Engine
 * image and image collection operations.
 */

import ee from '@google/earthengine';
import type {
  EEImage,
  EEImageCollection,
  EEGeometry,
  EEReducer,
  TimeRange,
  ImageMapCallback,
} from '../types.js';

/**
 * Loads an ImageCollection with spatial and temporal filters applied.
 *
 * @param collectionId - The Earth Engine collection ID (e.g., 'LANDSAT/LC08/C02/T1_L2').
 * @param geometry - The geometry to filter by bounds.
 * @param timeRange - The time range to filter by date.
 * @returns The filtered ImageCollection.
 *
 * @example
 * ```typescript
 * const collection = loadImageCollection(
 *   'LANDSAT/LC08/C02/T1_L2',
 *   ee.Geometry.Point([-122.4194, 37.7749]),
 *   { start: '2020-01-01', end: '2020-12-31' }
 * );
 * ```
 */
export function loadImageCollection(
  collectionId: string,
  geometry: EEGeometry,
  timeRange: TimeRange
): EEImageCollection {
  return ee
    .ImageCollection(collectionId)
    .filterBounds(geometry)
    .filterDate(timeRange.start, timeRange.end);
}

/**
 * Loads an Image by its asset ID.
 *
 * @param imageId - The Earth Engine image asset ID.
 * @returns The loaded Image.
 *
 * @example
 * ```typescript
 * const srtm = loadImage('USGS/SRTMGL1_003');
 * ```
 */
export function loadImage(imageId: string): EEImage {
  return ee.Image(imageId);
}

/**
 * Maps a function over an ImageCollection with type safety.
 *
 * @param collection - The ImageCollection to map over.
 * @param callback - The function to apply to each image.
 * @returns A new ImageCollection with the function applied.
 *
 * @example
 * ```typescript
 * const normalized = mapCollection(collection, (image) =>
 *   image.normalizedDifference(['B5', 'B4']).rename('NDVI')
 * );
 * ```
 */
export function mapCollection(
  collection: EEImageCollection,
  callback: ImageMapCallback
): EEImageCollection {
  return collection.map(callback);
}

/**
 * Creates a composite image from a collection using a reducer.
 *
 * @param collection - The ImageCollection to composite.
 * @param reducer - The reducer to use (defaults to median).
 * @returns A single composite Image.
 *
 * @example
 * ```typescript
 * const median = compositeCollection(collection);
 * const mean = compositeCollection(collection, ee.Reducer.mean());
 * ```
 */
export function compositeCollection(
  collection: EEImageCollection,
  reducer?: EEReducer
): EEImage {
  if (reducer) {
    return collection.reduce(reducer);
  }
  return collection.median();
}

/**
 * Filters a collection by cloud cover metadata.
 *
 * @param collection - The ImageCollection to filter.
 * @param maxCloudCover - Maximum cloud cover percentage (0-100).
 * @param propertyName - The cloud cover property name (defaults to 'CLOUD_COVER').
 * @returns The filtered ImageCollection.
 *
 * @example
 * ```typescript
 * const clearImages = filterByCloudCover(collection, 20);
 * ```
 */
export function filterByCloudCover(
  collection: EEImageCollection,
  maxCloudCover: number,
  propertyName = 'CLOUD_COVER'
): EEImageCollection {
  return collection.filter(ee.Filter.lte(propertyName, maxCloudCover));
}

/**
 * Selects specific bands from a collection.
 *
 * @param collection - The ImageCollection.
 * @param bands - Array of band names to select.
 * @param newNames - Optional new names for the bands.
 * @returns The collection with selected bands.
 *
 * @example
 * ```typescript
 * const rgb = selectBands(collection, ['B4', 'B3', 'B2'], ['red', 'green', 'blue']);
 * ```
 */
export function selectBands(
  collection: EEImageCollection,
  bands: string[],
  newNames?: string[]
): EEImageCollection {
  if (newNames) {
    return collection.select(bands, newNames);
  }
  return collection.select(bands);
}

/**
 * Calculates NDVI (Normalized Difference Vegetation Index) for an image.
 *
 * @param image - The input image.
 * @param nirBand - Name of the NIR band.
 * @param redBand - Name of the red band.
 * @returns The image with an NDVI band added.
 *
 * @example
 * ```typescript
 * const withNdvi = calculateNDVI(landsatImage, 'B5', 'B4');
 * ```
 */
export function calculateNDVI(
  image: EEImage,
  nirBand: string,
  redBand: string
): EEImage {
  return image.normalizedDifference([nirBand, redBand]).rename('NDVI');
}

/**
 * Clips an image to a geometry.
 *
 * @param image - The image to clip.
 * @param geometry - The geometry to clip to.
 * @returns The clipped image.
 *
 * @example
 * ```typescript
 * const clipped = clipImage(image, studyArea);
 * ```
 */
export function clipImage(image: EEImage, geometry: EEGeometry): EEImage {
  return image.clip(geometry);
}

/**
 * Clips all images in a collection to a geometry.
 *
 * @param collection - The ImageCollection to clip.
 * @param geometry - The geometry to clip to.
 * @returns The clipped ImageCollection.
 *
 * @example
 * ```typescript
 * const clipped = clipCollection(collection, studyArea);
 * ```
 */
export function clipCollection(
  collection: EEImageCollection,
  geometry: EEGeometry
): EEImageCollection {
  return collection.map((image) => (image as EEImage).clip(geometry));
}

/**
 * Gets the count of images in a collection.
 *
 * Note: This returns an ee.Number that must be evaluated with .getInfo()
 * to get the actual value.
 *
 * @param collection - The ImageCollection.
 * @returns An ee.Number representing the count.
 *
 * @example
 * ```typescript
 * const count = getCollectionSize(collection);
 * count.getInfo((n) => console.log(`Found ${n} images`));
 * ```
 */
export function getCollectionSize(collection: EEImageCollection) {
  return collection.size();
}

/**
 * Converts a collection to a list for iteration.
 *
 * @param collection - The ImageCollection.
 * @returns An ee.List of images.
 */
export function collectionToList(collection: EEImageCollection) {
  return collection.toList(collection.size());
}

