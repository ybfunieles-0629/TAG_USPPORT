import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryTimesService } from './delivery-times.service';

describe('DeliveryTimesService', () => {
  let service: DeliveryTimesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryTimesService],
    }).compile();

    service = module.get<DeliveryTimesService>(DeliveryTimesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
