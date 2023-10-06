import { Test, TestingModule } from '@nestjs/testing';
import { MarkedServicePricesService } from './marked-service-prices.service';

describe('MarkedServicePricesService', () => {
  let service: MarkedServicePricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarkedServicePricesService],
    }).compile();

    service = module.get<MarkedServicePricesService>(MarkedServicePricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
