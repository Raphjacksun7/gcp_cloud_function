import * as functions from '@google-cloud/functions-framework';
import { Storage } from '@google-cloud/storage';
import * as turf from '@turf/turf';
import { createObjectCsvStringifier } from 'csv-writer';

const storage = new Storage();
const bucketName = 'exercicee';
const coordonnees = 'coordonnees.txt';
const planCulture = 'plan-culture.geojson';

interface Coordinate {
  UID: string;
  Latitude: number;
  Longitude: number;
}

interface GeoJSONFeature {
  properties: {
    clecomposite: string;
    nochamp: string;
    culture: string;
    variete: string | null;
    nosemi: string;
    date_semi: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

// Validation functions
function isValidCoordinate(coord: Coordinate): boolean {
  return (
    coord.UID !== '' &&
    !isNaN(coord.Latitude) &&
    !isNaN(coord.Longitude) &&
    coord.Latitude >= -90 && coord.Latitude <= 90 &&
    coord.Longitude >= -180 && coord.Longitude <= 180
  );
}

function isValidGeoJSONFeature(feature: GeoJSONFeature): boolean {
  return (
    feature.geometry.type === 'Polygon' &&
    feature.geometry.coordinates.length > 0 &&
    feature.properties.clecomposite !== undefined
  );
}

export async function processCoordinates(req: any, res: any) {
  try {
    // Read coordinates file
    const coordsFile = storage.bucket(bucketName).file(coordonnees);
    const [coordsData] = await coordsFile.download();
    const coordsContent = coordsData.toString();
    
    // Parse and validate coordinates
    const coordinates: Coordinate[] = coordsContent
      .split('\n')
      .slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const [UID, Latitude, Longitude] = line.split('\t');
        const coord = {
          UID,
          Latitude: parseFloat(Latitude.replace(',', '.')),
          Longitude: parseFloat(Longitude.replace(',', '.'))
        };
        return coord;
      })
      .filter(isValidCoordinate);

    if (coordinates.length === 0) {
      throw new Error('No valid coordinates found');
    }

    // Read GeoJSON file
    const geojsonFile = storage.bucket(bucketName).file(planCulture);
    const [geojsonData] = await geojsonFile.download();
    const geojson = JSON.parse(geojsonData.toString());
    
    // Validate and filter features
    const features: GeoJSONFeature[] = geojson.features.filter(isValidGeoJSONFeature);

    if (features.length === 0) {
      throw new Error('No valid GeoJSON features found');
    }

    // Optimize: Create a spatial index or use more efficient search
    const csvRows = coordinates.flatMap(coord => {
      const point = turf.point([coord.Longitude, coord.Latitude]);
      
      return features
        .filter(feature => {
          const polygon = turf.polygon(feature.geometry.coordinates);
          return turf.booleanPointInPolygon(point, polygon);
        })
        .map(feature => ({
          UID: coord.UID,
          Latitude: coord.Latitude,
          Longitude: coord.Longitude,
          clecomposite: feature.properties.clecomposite,
          nochamp: feature.properties.nochamp,
          culture: feature.properties.culture,
          variete: feature.properties.variete || '',
          nosemi: feature.properties.nosemi,
          date_semi: feature.properties.date_semi
        }));
    });

    // Generate CSV content
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'UID', title: 'UID' },
        { id: 'Latitude', title: 'Latitude' },
        { id: 'Longitude', title: 'Longitude' },
        { id: 'clecomposite', title: 'clecomposite' },
        { id: 'nochamp', title: 'nochamp' },
        { id: 'culture', title: 'culture' },
        { id: 'variete', title: 'variete' },
        { id: 'nosemi', title: 'nosemi' },
        { id: 'date_semi', title: 'date_semi' }
      ]
    });

    const header = csvStringifier.getHeaderString();
    const csvContent = header + csvStringifier.stringifyRecords(csvRows);

    // Upload CSV to bucket
    const csvFile = storage.bucket(bucketName).file('resultat.csv');
    await csvFile.save(csvContent);

    // Log processing statistics
    console.log(`Processed ${coordinates.length} coordinates`);
    console.log(`Found matches in ${csvRows.length} rows`);

    res.status(200).send('resultat.csv generated successfully.');
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof Error) {
      res.status(500).send(`Error processing data: ${error.message}`);
    } else {
      res.status(500).send('An unknown error occurred');
    }
  }
}
functions.http('processCoordinates', processCoordinates);