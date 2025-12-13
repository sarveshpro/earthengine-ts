/**
 * @fileoverview Tests for geometry helper functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock geometry methods
const mockBuffer = vi.fn().mockReturnValue({});
const mockCentroid = vi.fn().mockReturnValue({});
const mockBounds = vi.fn().mockReturnValue({});
const mockArea = vi.fn().mockReturnValue({});
const mockUnion = vi.fn().mockReturnValue({});
const mockIntersection = vi.fn().mockReturnValue({});
const mockDifference = vi.fn().mockReturnValue({});

const mockGeometry = {
  buffer: mockBuffer,
  centroid: mockCentroid,
  bounds: mockBounds,
  area: mockArea,
  union: mockUnion,
  intersection: mockIntersection,
  difference: mockDifference,
};

vi.mock('@google/earthengine', () => {
  return {
    default: {
      Geometry: {
        Point: vi.fn(() => mockGeometry),
        Rectangle: vi.fn(() => mockGeometry),
        Polygon: vi.fn(() => mockGeometry),
        LineString: vi.fn(() => mockGeometry),
        MultiPoint: vi.fn(() => mockGeometry),
      },
      Feature: vi.fn((geom, props) => ({ geometry: geom, properties: props })),
      FeatureCollection: vi.fn((features) => ({ features })),
    },
  };
});

import {
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
} from '../../src/helpers/geometry.js';
import ee from '@google/earthengine';
import type { EEGeometry, EEFeature } from '../../src/types.js';

describe('Geometry Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPoint', () => {
    it('should create a point geometry', () => {
      createPoint(-122.4194, 37.7749);
      expect(ee.Geometry.Point).toHaveBeenCalledWith([-122.4194, 37.7749]);
    });
  });

  describe('createPointFromCoords', () => {
    it('should create a point from coordinate tuple', () => {
      createPointFromCoords([-122.4194, 37.7749]);
      expect(ee.Geometry.Point).toHaveBeenCalledWith([-122.4194, 37.7749]);
    });
  });

  describe('createRectangle', () => {
    it('should create a rectangle from bounding box', () => {
      createRectangle([-123, 37, -122, 38]);
      expect(ee.Geometry.Rectangle).toHaveBeenCalledWith([-123, 37, -122, 38]);
    });
  });

  describe('createPolygon', () => {
    it('should create a polygon from coordinates', () => {
      const coords = [
        [
          [-122.5, 37.5],
          [-122.0, 37.5],
          [-122.25, 38.0],
          [-122.5, 37.5],
        ],
      ] as Array<Array<[number, number]>>;
      createPolygon(coords);
      expect(ee.Geometry.Polygon).toHaveBeenCalledWith(coords);
    });
  });

  describe('createLineString', () => {
    it('should create a line string from coordinates', () => {
      const coords = [
        [-122.5, 37.5],
        [-122.0, 37.5],
        [-121.5, 38.0],
      ] as Array<[number, number]>;
      createLineString(coords);
      expect(ee.Geometry.LineString).toHaveBeenCalledWith(coords);
    });
  });

  describe('createMultiPoint', () => {
    it('should create a multi-point geometry', () => {
      const coords = [
        [-122.4194, 37.7749],
        [-118.2437, 34.0522],
      ] as Array<[number, number]>;
      createMultiPoint(coords);
      expect(ee.Geometry.MultiPoint).toHaveBeenCalledWith(coords);
    });
  });

  describe('bufferGeometry', () => {
    it('should buffer a geometry', () => {
      const geometry = mockGeometry as unknown as EEGeometry;
      bufferGeometry(geometry, 1000);
      expect(mockBuffer).toHaveBeenCalledWith(1000);
    });
  });

  describe('centroid', () => {
    it('should calculate centroid without maxError', () => {
      const geometry = mockGeometry as unknown as EEGeometry;
      centroid(geometry);
      expect(mockCentroid).toHaveBeenCalled();
    });

    it('should calculate centroid with maxError', () => {
      const geometry = mockGeometry as unknown as EEGeometry;
      centroid(geometry, 100);
      expect(mockCentroid).toHaveBeenCalledWith(100);
    });
  });

  describe('bounds', () => {
    it('should calculate bounds', () => {
      const geometry = mockGeometry as unknown as EEGeometry;
      bounds(geometry);
      expect(mockBounds).toHaveBeenCalled();
    });
  });

  describe('area', () => {
    it('should calculate area', () => {
      const geometry = mockGeometry as unknown as EEGeometry;
      area(geometry);
      expect(mockArea).toHaveBeenCalled();
    });
  });

  describe('union', () => {
    it('should calculate union of two geometries', () => {
      const geometry1 = mockGeometry as unknown as EEGeometry;
      const geometry2 = {} as EEGeometry;
      union(geometry1, geometry2);
      expect(mockUnion).toHaveBeenCalledWith(geometry2);
    });
  });

  describe('intersection', () => {
    it('should calculate intersection of two geometries', () => {
      const geometry1 = mockGeometry as unknown as EEGeometry;
      const geometry2 = {} as EEGeometry;
      intersection(geometry1, geometry2);
      expect(mockIntersection).toHaveBeenCalledWith(geometry2);
    });
  });

  describe('difference', () => {
    it('should calculate difference between two geometries', () => {
      const geometry1 = mockGeometry as unknown as EEGeometry;
      const geometry2 = {} as EEGeometry;
      difference(geometry1, geometry2);
      expect(mockDifference).toHaveBeenCalledWith(geometry2);
    });
  });

  describe('createFeature', () => {
    it('should create a feature without properties', () => {
      const geometry = {} as EEGeometry;
      createFeature(geometry);
      expect(ee.Feature).toHaveBeenCalledWith(geometry);
    });

    it('should create a feature with properties', () => {
      const geometry = {} as EEGeometry;
      const props = { name: 'Test', id: 1 };
      createFeature(geometry, props);
      expect(ee.Feature).toHaveBeenCalledWith(geometry, props);
    });
  });

  describe('createFeatureCollection', () => {
    it('should create a feature collection from features', () => {
      const features = [{} as EEFeature, {} as EEFeature];
      createFeatureCollection(features);
      expect(ee.FeatureCollection).toHaveBeenCalledWith(features);
    });
  });

  describe('featureCollectionFromGeometries', () => {
    it('should create a feature collection from geometries', () => {
      const geometries = [{} as EEGeometry, {} as EEGeometry];
      featureCollectionFromGeometries(geometries);
      expect(ee.Feature).toHaveBeenCalledTimes(2);
      expect(ee.FeatureCollection).toHaveBeenCalled();
    });
  });
});

