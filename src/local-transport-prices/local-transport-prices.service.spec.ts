import { Test, TestingModule } from '@nestjs/testing';
import { LocalTransportPricesService } from './local-transport-prices.service';

describe('LocalTransportPricesService', () => {
  let service: LocalTransportPricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalTransportPricesService],
    }).compile();

    service = module.get<LocalTransportPricesService>(LocalTransportPricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
