/**
 * @fileoverview Export task helper functions.
 *
 * This module provides typed helper functions for creating and managing
 * Earth Engine export tasks.
 */

import ee from '@google/earthengine';
import type {
  EEImage,
  EEFeatureCollection,
  DriveExportOptions,
  CloudStorageExportOptions,
  TableDriveExportOptions,
  TableCloudStorageExportOptions,
} from '../types.js';

/**
 * Export task object returned by Earth Engine.
 */
export interface ExportTask {
  /** Starts the export task. */
  start: () => void;
  /** Gets the task ID. */
  id: string | null;
  /** Checks the status of the task. */
  status: () => Promise<TaskStatus>;
}

/**
 * Status of an export task.
 */
export interface TaskStatus {
  state: 'UNSUBMITTED' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  id?: string;
  error_message?: string;
}

/**
 * Creates an export task for an image to Google Drive.
 *
 * @param image - The image to export.
 * @param options - Export configuration options.
 * @returns An export task that can be started.
 *
 * @example
 * ```typescript
 * const task = exportImageToDrive(composite, {
 *   description: 'my_export',
 *   folder: 'EarthEngine',
 *   scale: 30,
 *   region: studyArea,
 * });
 * task.start();
 * ```
 */
export function exportImageToDrive(
  image: EEImage,
  options: DriveExportOptions
): ExportTask {
  const {
    description,
    folder,
    scale,
    crs,
    maxPixels,
    region,
    fileFormat = 'GeoTIFF',
    formatOptions,
  } = options;

  const exportOptions: Record<string, unknown> = {
    image,
    description,
    fileFormat,
  };

  if (folder) exportOptions.folder = folder;
  if (scale) exportOptions.scale = scale;
  if (crs) exportOptions.crs = crs;
  if (maxPixels) exportOptions.maxPixels = maxPixels;
  if (region) exportOptions.region = region;
  if (formatOptions) exportOptions.formatOptions = formatOptions;

  return ee.batch.Export.image.toDrive(exportOptions) as unknown as ExportTask;
}

/**
 * Creates an export task for an image to Google Cloud Storage.
 *
 * @param image - The image to export.
 * @param options - Export configuration options.
 * @returns An export task that can be started.
 *
 * @example
 * ```typescript
 * const task = exportImageToCloudStorage(composite, {
 *   description: 'my_export',
 *   bucket: 'my-bucket',
 *   fileNamePrefix: 'exports/landsat',
 *   scale: 30,
 *   region: studyArea,
 * });
 * task.start();
 * ```
 */
export function exportImageToCloudStorage(
  image: EEImage,
  options: CloudStorageExportOptions
): ExportTask {
  const {
    description,
    bucket,
    fileNamePrefix,
    scale,
    crs,
    maxPixels,
    region,
    fileFormat = 'GeoTIFF',
    formatOptions,
  } = options;

  const exportOptions: Record<string, unknown> = {
    image,
    description,
    bucket,
    fileFormat,
  };

  if (fileNamePrefix) exportOptions.fileNamePrefix = fileNamePrefix;
  if (scale) exportOptions.scale = scale;
  if (crs) exportOptions.crs = crs;
  if (maxPixels) exportOptions.maxPixels = maxPixels;
  if (region) exportOptions.region = region;
  if (formatOptions) exportOptions.formatOptions = formatOptions;

  return ee.batch.Export.image.toCloudStorage(exportOptions) as unknown as ExportTask;
}

/**
 * Creates an export task for a FeatureCollection to Google Drive.
 *
 * @param collection - The FeatureCollection to export.
 * @param options - Export configuration options.
 * @returns An export task that can be started.
 *
 * @example
 * ```typescript
 * const task = exportTableToDrive(features, {
 *   description: 'my_features',
 *   folder: 'EarthEngine',
 *   fileFormat: 'GeoJSON',
 * });
 * task.start();
 * ```
 */
export function exportTableToDrive(
  collection: EEFeatureCollection,
  options: TableDriveExportOptions
): ExportTask {
  const { description, folder, fileFormat = 'CSV', selectors } = options;

  const exportOptions: Record<string, unknown> = {
    collection,
    description,
    fileFormat,
  };

  if (folder) exportOptions.folder = folder;
  if (selectors) exportOptions.selectors = selectors;

  return ee.batch.Export.table.toDrive(exportOptions) as unknown as ExportTask;
}

/**
 * Creates an export task for a FeatureCollection to Google Cloud Storage.
 *
 * @param collection - The FeatureCollection to export.
 * @param options - Export configuration options.
 * @returns An export task that can be started.
 *
 * @example
 * ```typescript
 * const task = exportTableToCloudStorage(features, {
 *   description: 'my_features',
 *   bucket: 'my-bucket',
 *   fileNamePrefix: 'exports/features',
 *   fileFormat: 'GeoJSON',
 * });
 * task.start();
 * ```
 */
export function exportTableToCloudStorage(
  collection: EEFeatureCollection,
  options: TableCloudStorageExportOptions
): ExportTask {
  const { description, bucket, fileNamePrefix, fileFormat = 'CSV', selectors } = options;

  const exportOptions: Record<string, unknown> = {
    collection,
    description,
    bucket,
    fileFormat,
  };

  if (fileNamePrefix) exportOptions.fileNamePrefix = fileNamePrefix;
  if (selectors) exportOptions.selectors = selectors;

  return ee.batch.Export.table.toCloudStorage(exportOptions) as unknown as ExportTask;
}

/**
 * Creates an export task for an image to an Earth Engine Asset.
 *
 * @param image - The image to export.
 * @param description - Description/name of the export task.
 * @param assetId - The destination asset ID.
 * @param options - Additional export options.
 * @returns An export task that can be started.
 *
 * @example
 * ```typescript
 * const task = exportImageToAsset(composite, 'my_composite', 'users/me/composites/2020', {
 *   scale: 30,
 *   region: studyArea,
 * });
 * task.start();
 * ```
 */
export function exportImageToAsset(
  image: EEImage,
  description: string,
  assetId: string,
  options: Partial<Omit<DriveExportOptions, 'description' | 'folder' | 'fileFormat'>> = {}
): ExportTask {
  const { scale, crs, maxPixels, region } = options;

  const exportOptions: Record<string, unknown> = {
    image,
    description,
    assetId,
  };

  if (scale) exportOptions.scale = scale;
  if (crs) exportOptions.crs = crs;
  if (maxPixels) exportOptions.maxPixels = maxPixels;
  if (region) exportOptions.region = region;

  return ee.batch.Export.image.toAsset(exportOptions) as unknown as ExportTask;
}

/**
 * Creates an export task for a FeatureCollection to an Earth Engine Asset.
 *
 * @param collection - The FeatureCollection to export.
 * @param description - Description/name of the export task.
 * @param assetId - The destination asset ID.
 * @returns An export task that can be started.
 *
 * @example
 * ```typescript
 * const task = exportTableToAsset(features, 'my_features', 'users/me/features/study_area');
 * task.start();
 * ```
 */
export function exportTableToAsset(
  collection: EEFeatureCollection,
  description: string,
  assetId: string
): ExportTask {
  return ee.batch.Export.table.toAsset({
    collection,
    description,
    assetId,
  }) as unknown as ExportTask;
}

/**
 * Starts multiple export tasks in sequence.
 *
 * @param tasks - Array of export tasks to start.
 *
 * @example
 * ```typescript
 * const tasks = [task1, task2, task3];
 * startTasks(tasks);
 * ```
 */
export function startTasks(tasks: ExportTask[]): void {
  for (const task of tasks) {
    task.start();
  }
}

