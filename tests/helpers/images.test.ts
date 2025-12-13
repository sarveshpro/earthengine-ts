/**
 * @fileoverview Tests for image helper functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the @google/earthengine module
const mockFilterBounds = vi.fn().mockReturnThis();
const mockFilterDate = vi.fn().mockReturnThis();
const mockFilter = vi.fn().mockReturnThis();
const mockMap = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockReduce = vi.fn().mockReturnValue({});
const mockMedian = vi.fn().mockReturnValue({});
const mockClip = vi.fn().mockReturnValue({});
const mockNormalizedDifference = vi.fn().mockReturnValue({ rename: vi.fn().mockReturnValue({}) });
const mockSize = vi.fn().mockReturnValue({ getInfo: vi.fn() });
const mockToList = vi.fn().mockReturnValue([]);

const mockCollection = {
  filterBounds: mockFilterBounds,
  filterDate: mockFilterDate,
  filter: mockFilter,
  map: mockMap,
  select: mockSelect,
  reduce: mockReduce,
  median: mockMedian,
  size: mockSize,
  toList: mockToList,
};

const mockImage = {
  clip: mockClip,
  normalizedDifference: mockNormalizedDifference,
};

vi.mock('@google/earthengine', () => {
  return {
    default: {
      ImageCollection: vi.fn(() => mockCollection),
      Image: vi.fn(() => mockImage),
      Filter: {
        lte: vi.fn().mockReturnValue({}),
      },
      Reducer: {
        mean: vi.fn().mockReturnValue({}),
      },
    },
  };
});

import {
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
} from '../../src/helpers/images.js';
import ee from '@google/earthengine';
import type { EEGeometry, EEImageCollection, EEImage } from '../../src/types.js';

describe('Image Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadImageCollection', () => {
    it('should create a filtered ImageCollection', () => {
      const geometry = {} as EEGeometry;
      const timeRange = { start: '2020-01-01', end: '2020-12-31' };

      loadImageCollection('LANDSAT/LC08/C02/T1_L2', geometry, timeRange);

      expect(ee.ImageCollection).toHaveBeenCalledWith('LANDSAT/LC08/C02/T1_L2');
      expect(mockFilterBounds).toHaveBeenCalledWith(geometry);
      expect(mockFilterDate).toHaveBeenCalledWith('2020-01-01', '2020-12-31');
    });
  });

  describe('loadImage', () => {
    it('should load an image by ID', () => {
      loadImage('USGS/SRTMGL1_003');
      expect(ee.Image).toHaveBeenCalledWith('USGS/SRTMGL1_003');
    });
  });

  describe('mapCollection', () => {
    it('should map a function over the collection', () => {
      const collection = mockCollection as unknown as EEImageCollection;
      const callback = vi.fn((img) => img);

      mapCollection(collection, callback);

      expect(mockMap).toHaveBeenCalledWith(callback);
    });
  });

  describe('compositeCollection', () => {
    it('should create median composite by default', () => {
      const collection = mockCollection as unknown as EEImageCollection;

      compositeCollection(collection);

      expect(mockMedian).toHaveBeenCalled();
    });

    it('should use custom reducer when provided', () => {
      const collection = mockCollection as unknown as EEImageCollection;
      const reducer = {} as ReturnType<typeof ee.Reducer.mean>;

      compositeCollection(collection, reducer);

      expect(mockReduce).toHaveBeenCalledWith(reducer);
    });
  });

  describe('filterByCloudCover', () => {
    it('should filter collection by cloud cover', () => {
      const collection = mockCollection as unknown as EEImageCollection;

      filterByCloudCover(collection, 20);

      expect(ee.Filter.lte).toHaveBeenCalledWith('CLOUD_COVER', 20);
      expect(mockFilter).toHaveBeenCalled();
    });

    it('should use custom property name', () => {
      const collection = mockCollection as unknown as EEImageCollection;

      filterByCloudCover(collection, 30, 'CLOUDY_PIXEL_PERCENTAGE');

      expect(ee.Filter.lte).toHaveBeenCalledWith('CLOUDY_PIXEL_PERCENTAGE', 30);
    });
  });

  describe('selectBands', () => {
    it('should select bands from collection', () => {
      const collection = mockCollection as unknown as EEImageCollection;

      selectBands(collection, ['B4', 'B3', 'B2']);

      expect(mockSelect).toHaveBeenCalledWith(['B4', 'B3', 'B2']);
    });

    it('should rename bands when new names provided', () => {
      const collection = mockCollection as unknown as EEImageCollection;

      selectBands(collection, ['B4', 'B3', 'B2'], ['red', 'green', 'blue']);

      expect(mockSelect).toHaveBeenCalledWith(['B4', 'B3', 'B2'], ['red', 'green', 'blue']);
    });
  });

  describe('calculateNDVI', () => {
    it('should calculate NDVI for an image', () => {
      const image = mockImage as unknown as EEImage;

      calculateNDVI(image, 'B5', 'B4');

      expect(mockNormalizedDifference).toHaveBeenCalledWith(['B5', 'B4']);
    });
  });

  describe('clipImage', () => {
    it('should clip image to geometry', () => {
      const image = mockImage as unknown as EEImage;
      const geometry = {} as EEGeometry;

      clipImage(image, geometry);

      expect(mockClip).toHaveBeenCalledWith(geometry);
    });
  });

  describe('clipCollection', () => {
    it('should clip all images in collection', () => {
      const collection = mockCollection as unknown as EEImageCollection;
      const geometry = {} as EEGeometry;

      clipCollection(collection, geometry);

      expect(mockMap).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('getCollectionSize', () => {
    it('should return collection size', () => {
      const collection = mockCollection as unknown as EEImageCollection;

      getCollectionSize(collection);

      expect(mockSize).toHaveBeenCalled();
    });
  });

  describe('collectionToList', () => {
    it('should convert collection to list', () => {
      const collection = mockCollection as unknown as EEImageCollection;

      collectionToList(collection);

      expect(mockSize).toHaveBeenCalled();
      expect(mockToList).toHaveBeenCalled();
    });
  });
});

