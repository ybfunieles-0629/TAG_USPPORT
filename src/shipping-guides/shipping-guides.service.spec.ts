import { Test, TestingModule } from '@nestjs/testing';
import { ShippingGuidesService } from './shipping-guides.service';

describe('ShippingGuidesService', () => {
  let service: ShippingGuidesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShippingGuidesService],
    }).compile();

    service = module.get<ShippingGuidesService>(ShippingGuidesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
