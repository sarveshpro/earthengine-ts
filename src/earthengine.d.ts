/**
 * @fileoverview Type declarations for @google/earthengine.
 *
 * The official @google/earthengine package does not include TypeScript definitions.
 * This file provides minimal type declarations to enable TypeScript compilation.
 *
 * Note: These types are intentionally minimal and use 'any' in many places because
 * the Earth Engine API is highly dynamic. The wrapper functions in this package
 * provide more specific types where possible.
 */

declare module '@google/earthengine' {
  // ==========================================================================
  // Core EE Namespace
  // ==========================================================================

  interface EEData {
    authenticateViaPrivateKey(
      credentials: { client_email: string; private_key: string },
      success: () => void,
      error: (error: Error) => void
    ): void;

    authenticateViaOauth(
      clientId: string,
      success: () => void,
      error: (error: Error) => void,
      scopes?: string[],
      onImmediateFailed?: (() => void) | null
    ): void;

    setAuthToken(
      clientId: string,
      tokenType: string,
      accessToken: string,
      expiresIn: number,
      extraScopes?: string[],
      callback?: (() => void) | undefined,
      updateAuthLibrary?: boolean
    ): void;

    getApiBaseUrl(): string | null;
  }

  interface EEBatchExport {
    Export: {
      image: {
        toDrive(options: Record<string, unknown>): unknown;
        toCloudStorage(options: Record<string, unknown>): unknown;
        toAsset(options: Record<string, unknown>): unknown;
      };
      table: {
        toDrive(options: Record<string, unknown>): unknown;
        toCloudStorage(options: Record<string, unknown>): unknown;
        toAsset(options: Record<string, unknown>): unknown;
      };
    };
  }

  // ==========================================================================
  // EE Objects
  // ==========================================================================

  interface EEImageMethods {
    clip(geometry: unknown): EEImageMethods;
    select(...args: unknown[]): EEImageMethods;
    normalizedDifference(bands: string[]): EEImageMethods;
    rename(...args: string[]): EEImageMethods;
    addBands(image: unknown): EEImageMethods;
    multiply(value: unknown): EEImageMethods;
    divide(value: unknown): EEImageMethods;
    add(value: unknown): EEImageMethods;
    subtract(value: unknown): EEImageMethods;
    reduceRegion(options: Record<string, unknown>): unknown;
    reduceRegions(options: Record<string, unknown>): unknown;
    getInfo(callback?: (result: unknown) => void): unknown;
    [key: string]: unknown;
  }

  interface EEImageCollectionMethods {
    filterBounds(geometry: unknown): EEImageCollectionMethods;
    filterDate(start: string | Date, end: string | Date): EEImageCollectionMethods;
    filter(filter: unknown): EEImageCollectionMethods;
    map(callback: (image: EEImageMethods) => EEImageMethods): EEImageCollectionMethods;
    select(...args: unknown[]): EEImageCollectionMethods;
    reduce(reducer: unknown): EEImageMethods;
    median(): EEImageMethods;
    mean(): EEImageMethods;
    min(): EEImageMethods;
    max(): EEImageMethods;
    mosaic(): EEImageMethods;
    first(): EEImageMethods;
    size(): unknown;
    toList(count: unknown): unknown;
    getInfo(callback?: (result: unknown) => void): unknown;
    [key: string]: unknown;
  }

  interface EEGeometryMethods {
    buffer(distance: number, maxError?: number): EEGeometryMethods;
    centroid(maxError?: number): EEGeometryMethods;
    bounds(maxError?: number): EEGeometryMethods;
    area(maxError?: number): unknown;
    union(other: EEGeometryMethods, maxError?: number): EEGeometryMethods;
    intersection(other: EEGeometryMethods, maxError?: number): EEGeometryMethods;
    difference(other: EEGeometryMethods, maxError?: number): EEGeometryMethods;
    contains(other: EEGeometryMethods): unknown;
    getInfo(callback?: (result: unknown) => void): unknown;
    [key: string]: unknown;
  }

  interface EEFeatureMethods {
    geometry(): EEGeometryMethods;
    get(property: string): unknown;
    set(property: string, value: unknown): EEFeatureMethods;
    getInfo(callback?: (result: unknown) => void): unknown;
    [key: string]: unknown;
  }

  interface EEFeatureCollectionMethods {
    filterBounds(geometry: unknown): EEFeatureCollectionMethods;
    filter(filter: unknown): EEFeatureCollectionMethods;
    map(callback: (feature: EEFeatureMethods) => EEFeatureMethods): EEFeatureCollectionMethods;
    size(): unknown;
    first(): EEFeatureMethods;
    getInfo(callback?: (result: unknown) => void): unknown;
    [key: string]: unknown;
  }

  interface EEFilterMethods {
    lte(property: string, value: number): unknown;
    gte(property: string, value: number): unknown;
    lt(property: string, value: number): unknown;
    gt(property: string, value: number): unknown;
    eq(property: string, value: unknown): unknown;
    neq(property: string, value: unknown): unknown;
    and(...filters: unknown[]): unknown;
    or(...filters: unknown[]): unknown;
    bounds(geometry: unknown): unknown;
    date(start: string | Date, end: string | Date): unknown;
    [key: string]: unknown;
  }

  interface EEReducerMethods {
    mean(): unknown;
    median(): unknown;
    min(): unknown;
    max(): unknown;
    sum(): unknown;
    count(): unknown;
    first(): unknown;
    last(): unknown;
    stdDev(): unknown;
    variance(): unknown;
    percentile(percentiles: number[]): unknown;
    [key: string]: unknown;
  }

  // ==========================================================================
  // Main EE Interface
  // ==========================================================================

  interface EE {
    data: EEData;
    batch: EEBatchExport;

    initialize(
      opt_baseurl: string | null,
      opt_tileurl: string | null,
      success?: () => void,
      error?: (error: Error) => void,
      opt_xsrfToken?: string | null,
      opt_project?: Record<string, unknown>
    ): void;

    reset(): void;

    Image(imageId?: string | unknown): EEImageMethods;
    ImageCollection(collectionId?: string | unknown[]): EEImageCollectionMethods;
    Feature(geometry: unknown, properties?: Record<string, unknown>): EEFeatureMethods;
    FeatureCollection(features: unknown[] | string): EEFeatureCollectionMethods;

    Geometry: {
      Point(coords: [number, number] | number[]): EEGeometryMethods;
      MultiPoint(coords: Array<[number, number]> | number[][]): EEGeometryMethods;
      LineString(coords: Array<[number, number]> | number[][]): EEGeometryMethods;
      MultiLineString(coords: number[][][]): EEGeometryMethods;
      Polygon(coords: number[][][]): EEGeometryMethods;
      MultiPolygon(coords: number[][][][]): EEGeometryMethods;
      Rectangle(coords: [number, number, number, number] | number[]): EEGeometryMethods;
      BBox(west: number, south: number, east: number, north: number): EEGeometryMethods;
    };

    Filter: EEFilterMethods;
    Reducer: EEReducerMethods;

    Number(value: number | unknown): unknown;
    String(value: string | unknown): unknown;
    List(list: unknown[]): unknown;
    Dictionary(dict: Record<string, unknown>): unknown;
    Date(date: string | Date | number): unknown;
    Array(values: unknown[]): unknown;

    Algorithms: Record<string, (...args: unknown[]) => unknown>;
    Terrain: Record<string, (...args: unknown[]) => unknown>;

    [key: string]: unknown;
  }

  const ee: EE;
  export default ee;
  export = ee;
}

