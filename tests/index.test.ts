import { processCoordinates } from '../src/index';

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      file: jest.fn().mockImplementation((filename: string) => ({
        download: jest.fn().mockResolvedValue([
          Buffer.from(filename === 'coordonnees.txt' 
            ? 'UID\tLatitude\tLongitude\n001\t45.5\t-73.6'
            : '{"features":[{"properties":{},"geometry":{"type":"Polygon"}}]}')
        ]),
        save: jest.fn()
      }))
    }))
  }))
}));

jest.mock('@turf/turf', () => ({
  point: () => ({}),
  polygon: () => ({}),
  booleanPointInPolygon: () => true
}));

describe('processCoordinates', () => {
  const mockReq = {} as any;
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as any;

  it('should complete without errors', async () => {
    await processCoordinates(mockReq, mockRes);
    expect(mockRes.send).toHaveBeenCalled();
  });
});