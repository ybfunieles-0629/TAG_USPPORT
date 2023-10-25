import { Test, TestingModule } from '@nestjs/testing';
import { TransportServicesService } from './transport-services.service';

describe('TransportServicesService', () => {
  let service: TransportServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransportServicesService],
    }).compile();

    service = module.get<TransportServicesService>(TransportServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
