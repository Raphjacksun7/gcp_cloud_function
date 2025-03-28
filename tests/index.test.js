"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const storage_1 = require("@google-cloud/storage");
const turf = __importStar(require("@turf/turf"));
// Mock external modules
jest.mock('@google-cloud/storage');
jest.mock('@turf/turf');
const mockDownload = jest.fn();
const mockSave = jest.fn();
storage_1.Storage.mockImplementation(() => ({
    bucket: () => ({
        file: () => ({
            download: mockDownload,
            save: mockSave,
        }),
    }),
}));
describe('processCoordinates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should generate CSV for coordinates inside polygons', async () => {
        // Mock coordinate data
        mockDownload.mockResolvedValueOnce([Buffer.from('UID\tLatitude\tLongitude\n1\t45,5\t-73,6')]);
        // Mock GeoJSON data
        const mockFeature = {
            properties: {
                clecomposite: 'key',
                nochamp: '1',
                culture: 'corn',
                variete: null,
                nosemi: '2',
                date_semi: '2025-03-28',
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0]]],
            },
        };
        mockDownload.mockResolvedValueOnce([Buffer.from(JSON.stringify({ features: [mockFeature] }))]);
        // Mock Turf.js
        turf.booleanPointInPolygon.mockReturnValue(true);
        // Mock Express response
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        await (0, index_1.processCoordinates)({}, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockSave).toHaveBeenCalledWith(expect.stringContaining('1,45.5,-73.6,key,1,corn,,2,2025-03-28'));
    });
    it('should handle empty files', async () => {
        mockDownload.mockResolvedValueOnce([Buffer.from('')]);
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        await (0, index_1.processCoordinates)({}, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
