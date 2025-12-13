# @planet/earthengine-ts

> **Unofficial** TypeScript wrapper around the Google Earth Engine JavaScript client

[![npm version](https://img.shields.io/npm/v/@planet/earthengine-ts.svg)](https://www.npmjs.com/package/@planet/earthengine-ts)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This package provides strongly-typed, ergonomic helpers for common [Google Earth Engine](https://earthengine.google.com/) operations. It wraps and re-exports the official [`@google/earthengine`](https://www.npmjs.com/package/@google/earthengine) client in a TypeScript-friendly way.

## Disclaimer

**This is NOT an official Google product.**

- Earth Engine and the official JavaScript client are developed and owned by Google.
- This wrapper is an independent, community-maintained project.
- Users must comply with the [Google Earth Engine Terms of Service](https://earthengine.google.com/terms/) and [Additional API Terms](https://developers.google.com/earth-engine/reference/Additional.API.Terms).
- The underlying `@google/earthengine` package is licensed under [Apache-2.0](https://www.npmjs.com/package/@google/earthengine).

## Installation

```bash
npm install @planet/earthengine-ts @google/earthengine
```

Or with other package managers:

```bash
# Yarn
yarn add @planet/earthengine-ts @google/earthengine

# pnpm
pnpm add @planet/earthengine-ts @google/earthengine
```

## Quick Start

### Service Account Authentication (Node.js)

```typescript
import { initEarthEngine, ee, loadImageCollection, createPoint } from '@planet/earthengine-ts';

// Initialize with service account
await initEarthEngine({
  privateKeyJson: require('./service-account.json'),
  project: 'my-gcp-project',
});

// Create a point geometry
const sanFrancisco = createPoint(-122.4194, 37.7749);

// Load a Landsat collection with filters
const collection = loadImageCollection(
  'LANDSAT/LC08/C02/T1_L2',
  sanFrancisco,
  { start: '2020-01-01', end: '2020-12-31' }
);

// Get the collection size
collection.size().getInfo((count) => {
  console.log(`Found ${count} images`);
});
```

### Using the Raw `ee` Object

You can still use the underlying `ee` object directly for full API access:

```typescript
import { initEarthEngine, ee } from '@planet/earthengine-ts';

await initEarthEngine({ project: 'my-project' });

// Use ee directly as you would with the official client
const image = ee.Image('USGS/SRTMGL1_003');
const elevation = image.select('elevation');
```

## Authentication Methods

### Service Account (Recommended for Server-side)

```typescript
import { initEarthEngine } from '@planet/earthengine-ts';
import fs from 'fs';

// From JSON file
await initEarthEngine({
  privateKeyJson: fs.readFileSync('./service-account.json', 'utf-8'),
  project: 'my-gcp-project',
});

// Or pass the parsed object directly
await initEarthEngine({
  privateKeyJson: {
    email: 'my-service-account@my-project.iam.gserviceaccount.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
  },
  project: 'my-gcp-project',
});
```

### Custom Token Retriever

```typescript
import { initEarthEngine } from '@planet/earthengine-ts';

await initEarthEngine({
  tokenRetriever: async () => {
    // Fetch token from your auth provider, vault, etc.
    const response = await fetch('https://my-auth-server/token');
    const { access_token } = await response.json();
    return access_token;
  },
  project: 'my-gcp-project',
});
```

### OAuth (Browser)

```typescript
import { initWithOAuth } from '@planet/earthengine-ts';

await initWithOAuth({
  clientId: 'your-client-id.apps.googleusercontent.com',
  project: 'my-gcp-project',
});
```

## API Overview

### Initialization

| Function | Description |
|----------|-------------|
| `initEarthEngine(options)` | Initialize with service account or custom token |
| `initWithOAuth(options)` | Initialize with OAuth (browser) |
| `isInitialized()` | Check if EE is initialized |
| `resetClient()` | Reset the client state |

### Image Helpers

```typescript
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
} from '@planet/earthengine-ts';

// Load and filter a collection
const collection = loadImageCollection(
  'COPERNICUS/S2_SR_HARMONIZED',
  geometry,
  { start: '2023-01-01', end: '2023-12-31' }
);

// Filter by cloud cover
const clearImages = filterByCloudCover(collection, 20);

// Create a median composite
const composite = compositeCollection(clearImages);

// Calculate NDVI
const ndvi = calculateNDVI(composite, 'B8', 'B4');
```

### Geometry Helpers

```typescript
import {
  createPoint,
  createRectangle,
  createPolygon,
  bufferGeometry,
  union,
  intersection,
  createFeature,
  createFeatureCollection,
} from '@planet/earthengine-ts';

// Create geometries
const point = createPoint(-122.4194, 37.7749);
const bbox = createRectangle([-123, 37, -122, 38]);

// Buffer a point by 1km
const buffered = bufferGeometry(point, 1000);

// Combine geometries
const combined = union(bbox, buffered);

// Create features with properties
const feature = createFeature(polygon, { name: 'Study Area', id: 1 });
```

### Export Helpers

```typescript
import {
  exportImageToDrive,
  exportImageToCloudStorage,
  exportTableToDrive,
  exportImageToAsset,
  startTasks,
} from '@planet/earthengine-ts';

// Export to Google Drive
const driveTask = exportImageToDrive(composite, {
  description: 'landsat_composite_2023',
  folder: 'EarthEngine',
  scale: 30,
  region: studyArea,
});
driveTask.start();

// Export to Cloud Storage
const gcsTask = exportImageToCloudStorage(composite, {
  description: 'landsat_composite_2023',
  bucket: 'my-bucket',
  fileNamePrefix: 'exports/landsat',
  scale: 30,
  region: studyArea,
});
gcsTask.start();

// Start multiple tasks at once
startTasks([task1, task2, task3]);
```

## Type Definitions

The package exports type aliases for common Earth Engine objects:

```typescript
import type {
  EEImage,
  EEImageCollection,
  EEGeometry,
  EEFeature,
  EEFeatureCollection,
  TimeRange,
  BoundingBox,
  DriveExportOptions,
  CloudStorageExportOptions,
} from '@planet/earthengine-ts';
```

## Example Workflow

Here's a complete example that loads Sentinel-2 imagery, creates a cloud-free composite, and exports it:

```typescript
import {
  initEarthEngine,
  loadImageCollection,
  filterByCloudCover,
  compositeCollection,
  clipImage,
  createRectangle,
  exportImageToDrive,
} from '@planet/earthengine-ts';

async function main() {
  // Initialize
  await initEarthEngine({
    privateKeyJson: process.env.EARTHENGINE_KEY,
    project: 'my-project',
  });

  // Define study area
  const studyArea = createRectangle([-122.5, 37.5, -122.0, 38.0]);

  // Load Sentinel-2 data
  const s2 = loadImageCollection(
    'COPERNICUS/S2_SR_HARMONIZED',
    studyArea,
    { start: '2023-06-01', end: '2023-09-30' }
  );

  // Filter clouds and create composite
  const clearImages = filterByCloudCover(s2, 10, 'CLOUDY_PIXEL_PERCENTAGE');
  const composite = compositeCollection(clearImages);

  // Clip to study area
  const clipped = clipImage(composite, studyArea);

  // Export to Drive
  const task = exportImageToDrive(clipped, {
    description: 'sentinel2_composite_summer_2023',
    folder: 'EarthEngine',
    scale: 10,
    region: studyArea,
    maxPixels: 1e13,
  });

  task.start();
  console.log('Export task started!');
}

main().catch(console.error);
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This wrapper is licensed under the [Apache License 2.0](./LICENSE).

### Third-Party Licenses

This package depends on [`@google/earthengine`](https://www.npmjs.com/package/@google/earthengine), which is:
- Copyright Google LLC
- Licensed under the Apache License 2.0

## Links

- [Google Earth Engine](https://earthengine.google.com/)
- [Earth Engine JavaScript API](https://developers.google.com/earth-engine/guides/getstarted)
- [Earth Engine Terms of Service](https://earthengine.google.com/terms/)
- [Additional API Terms](https://developers.google.com/earth-engine/reference/Additional.API.Terms)
- [@google/earthengine on npm](https://www.npmjs.com/package/@google/earthengine)

