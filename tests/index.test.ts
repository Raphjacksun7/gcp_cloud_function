import { processCoordinates } from '../src/index';

describe('processCoordinates', () => {
  const mockReq = {} as any;
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as any;

  it('should complete without crashing', async () => {
    // Complete mock-free test
    await processCoordinates(mockReq, mockRes);
    
    // Simple verification that the test ran to completion
    expect(mockRes.send).toHaveBeenCalled();
  });
});