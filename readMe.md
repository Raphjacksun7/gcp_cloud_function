# Agrisoft Cloud Function - Coordinate Processor

A Google Cloud Function (HTTP-triggered) written in TypeScript that processes geographic coordinates against agricultural field polygons (GeoJSON) to generate a CSV report.

## Features
- **GeoJSON Polygon Matching**: Uses Turf.js to check coordinate-in-polygon relationships
- **GCP Integration**: Works with Cloud Storage for file I/O
- **CSV Generation**: Produces `resultat.csv` with merged coordinate and field data
- **Type Safety**: Fully typed interfaces for coordinates and GeoJSON features
- **Unit Tests**: Jest tests with mocked GCP and Turf.js dependencies

## Prerequisites
- Google Cloud Platform account
- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- GCP Services Enabled:
  - Cloud Functions (Gen2)
  - Cloud Storage

## Setup
1. **Clone Repository**
   ```bash
   git clone https://github.com/Raphjacksun7/gcp_cloud_function
   cd gcp_cloud_function
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure GCP**
   - Create `exercice` bucket in Cloud Storage
   - Set IAM permissions using `role.sh`:
     ```bash
     chmod +x role.sh
     ./role.sh
     ```

## Deployment
```bash
pnpm deploy
```

## Testing
**Unit Tests**  
```bash
pnpm test
```

**Integration Test**  
```bash
pnpm check-result
```

