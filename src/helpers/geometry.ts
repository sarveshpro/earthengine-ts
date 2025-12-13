/**
 * @fileoverview Geometry creation and manipulation helper functions.
 *
 * This module provides typed helper functions for creating and working
 * with Earth Engine geometry objects.
 */

import ee from '@google/earthengine';
import type {
  EEGeometry,
  EEFeature,
  EEFeatureCollection,
  BoundingBox,
  PointCoordinates,
  PolygonCoordinates,
} from '../types.js';

/**
 * Creates a Point geometry from coordinates.
 *
 * @param longitude - The longitude (X coordinate).
 * @param latitude - The latitude (Y coordinate).
 * @returns An Earth Engine Point geometry.
 *
 * @example
 * ```typescript
 * const sanFrancisco = createPoint(-122.4194, 37.7749);
 * ```
 */
export function createPoint(longitude: number, latitude: number): EEGeometry {
  return ee.Geometry.Point([longitude, latitude]);
}

/**
 * Creates a Point geometry from a coordinate tuple.
 *
 * @param coords - The [longitude, latitude] coordinates.
 * @returns An Earth Engine Point geometry.
 *
 * @example
 * ```typescript
 * const point = createPointFromCoords([-122.4194, 37.7749]);
 * ```
 */
export function createPointFromCoords(coords: PointCoordinates): EEGeometry {
  return ee.Geometry.Point(coords);
}

/**
 * Creates a Rectangle geometry from bounding box coordinates.
 *
 * @param bounds - The bounding box as [west, south, east, north].
 * @returns An Earth Engine Rectangle geometry.
 *
 * @example
 * ```typescript
 * const bbox = createRectangle([-123, 37, -122, 38]);
 * ```
 */
export function createRectangle(bounds: BoundingBox): EEGeometry {
  const [west, south, east, north] = bounds;
  return ee.Geometry.Rectangle([west, south, east, north]);
}

/**
 * Creates a Polygon geometry from coordinates.
 *
 * @param coordinates - The polygon coordinates as an array of rings.
 * @returns An Earth Engine Polygon geometry.
 *
 * @example
 * ```typescript
 * const triangle = createPolygon([[
 *   [-122.5, 37.5],
 *   [-122.0, 37.5],
 *   [-122.25, 38.0],
 *   [-122.5, 37.5], // Close the ring
 * ]]);
 * ```
 */
export function createPolygon(coordinates: PolygonCoordinates): EEGeometry {
  return ee.Geometry.Polygon(coordinates);
}

/**
 * Creates a LineString geometry from coordinates.
 *
 * @param coordinates - Array of [longitude, latitude] coordinate pairs.
 * @returns An Earth Engine LineString geometry.
 *
 * @example
 * ```typescript
 * const line = createLineString([
 *   [-122.5, 37.5],
 *   [-122.0, 37.5],
 *   [-121.5, 38.0],
 * ]);
 * ```
 */
export function createLineString(coordinates: PointCoordinates[]): EEGeometry {
  return ee.Geometry.LineString(coordinates);
}

/**
 * Creates a MultiPoint geometry from an array of coordinates.
 *
 * @param coordinates - Array of [longitude, latitude] coordinate pairs.
 * @returns An Earth Engine MultiPoint geometry.
 *
 * @example
 * ```typescript
 * const points = createMultiPoint([
 *   [-122.4194, 37.7749],
 *   [-118.2437, 34.0522],
 *   [-73.9857, 40.7484],
 * ]);
 * ```
 */
export function createMultiPoint(coordinates: PointCoordinates[]): EEGeometry {
  return ee.Geometry.MultiPoint(coordinates);
}

/**
 * Buffers a geometry by a specified distance.
 *
 * @param geometry - The geometry to buffer.
 * @param distance - The buffer distance in meters.
 * @returns The buffered geometry.
 *
 * @example
 * ```typescript
 * const buffered = bufferGeometry(point, 1000); // 1km buffer
 * ```
 */
export function bufferGeometry(geometry: EEGeometry, distance: number): EEGeometry {
  return geometry.buffer(distance);
}

/**
 * Calculates the centroid of a geometry.
 *
 * @param geometry - The input geometry.
 * @param maxError - Maximum error in meters (optional).
 * @returns The centroid as a Point geometry.
 *
 * @example
 * ```typescript
 * const center = centroid(polygon);
 * ```
 */
export function centroid(geometry: EEGeometry, maxError?: number): EEGeometry {
  if (maxError !== undefined) {
    return geometry.centroid(maxError);
  }
  return geometry.centroid();
}

/**
 * Calculates the bounding box of a geometry.
 *
 * @param geometry - The input geometry.
 * @param maxError - Maximum error in meters (optional).
 * @returns The bounding box as a Rectangle geometry.
 *
 * @example
 * ```typescript
 * const bbox = bounds(irregularPolygon);
 * ```
 */
export function bounds(geometry: EEGeometry, maxError?: number): EEGeometry {
  if (maxError !== undefined) {
    return geometry.bounds(maxError);
  }
  return geometry.bounds();
}

/**
 * Calculates the area of a geometry in square meters.
 *
 * @param geometry - The input geometry.
 * @param maxError - Maximum error in meters (optional).
 * @returns An ee.Number representing the area.
 *
 * @example
 * ```typescript
 * const areaM2 = area(polygon);
 * areaM2.getInfo((a) => console.log(`Area: ${a / 1e6} km²`));
 * ```
 */
export function area(geometry: EEGeometry, maxError?: number) {
  if (maxError !== undefined) {
    return geometry.area(maxError);
  }
  return geometry.area();
}

/**
 * Calculates the union of two geometries.
 *
 * @param geometry1 - The first geometry.
 * @param geometry2 - The second geometry.
 * @param maxError - Maximum error in meters (optional).
 * @returns The union of the two geometries.
 *
 * @example
 * ```typescript
 * const combined = union(polygon1, polygon2);
 * ```
 */
export function union(
  geometry1: EEGeometry,
  geometry2: EEGeometry,
  maxError?: number
): EEGeometry {
  if (maxError !== undefined) {
    return geometry1.union(geometry2, maxError);
  }
  return geometry1.union(geometry2);
}

/**
 * Calculates the intersection of two geometries.
 *
 * @param geometry1 - The first geometry.
 * @param geometry2 - The second geometry.
 * @param maxError - Maximum error in meters (optional).
 * @returns The intersection of the two geometries.
 *
 * @example
 * ```typescript
 * const overlap = intersection(polygon1, polygon2);
 * ```
 */
export function intersection(
  geometry1: EEGeometry,
  geometry2: EEGeometry,
  maxError?: number
): EEGeometry {
  if (maxError !== undefined) {
    return geometry1.intersection(geometry2, maxError);
  }
  return geometry1.intersection(geometry2);
}

/**
 * Calculates the difference between two geometries.
 *
 * @param geometry1 - The geometry to subtract from.
 * @param geometry2 - The geometry to subtract.
 * @param maxError - Maximum error in meters (optional).
 * @returns geometry1 minus geometry2.
 *
 * @example
 * ```typescript
 * const remaining = difference(largePolygon, holePolygon);
 * ```
 */
export function difference(
  geometry1: EEGeometry,
  geometry2: EEGeometry,
  maxError?: number
): EEGeometry {
  if (maxError !== undefined) {
    return geometry1.difference(geometry2, maxError);
  }
  return geometry1.difference(geometry2);
}

/**
 * Creates a Feature from a geometry with optional properties.
 *
 * @param geometry - The geometry for the feature.
 * @param properties - Optional properties dictionary.
 * @returns An Earth Engine Feature.
 *
 * @example
 * ```typescript
 * const feature = createFeature(polygon, { name: 'Study Area', id: 1 });
 * ```
 */
export function createFeature(
  geometry: EEGeometry,
  properties?: Record<string, unknown>
): EEFeature {
  if (properties) {
    return ee.Feature(geometry, properties);
  }
  return ee.Feature(geometry);
}

/**
 * Creates a FeatureCollection from an array of features.
 *
 * @param features - Array of Earth Engine Features.
 * @returns An Earth Engine FeatureCollection.
 *
 * @example
 * ```typescript
 * const fc = createFeatureCollection([feature1, feature2, feature3]);
 * ```
 */
export function createFeatureCollection(features: EEFeature[]): EEFeatureCollection {
  return ee.FeatureCollection(features);
}

/**
 * Creates a FeatureCollection from an array of geometries.
 *
 * @param geometries - Array of Earth Engine Geometries.
 * @returns An Earth Engine FeatureCollection.
 *
 * @example
 * ```typescript
 * const fc = featureCollectionFromGeometries([polygon1, polygon2]);
 * ```
 */
export function featureCollectionFromGeometries(geometries: EEGeometry[]): EEFeatureCollection {
  const features = geometries.map((geom) => ee.Feature(geom));
  return ee.FeatureCollection(features);
}

