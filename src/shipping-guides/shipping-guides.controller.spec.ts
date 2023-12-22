import { Test, TestingModule } from '@nestjs/testing';
import { ShippingGuidesController } from './shipping-guides.controller';
import { ShippingGuidesService } from './shipping-guides.service';

describe('ShippingGuidesController', () => {
  let controller: ShippingGuidesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippingGuidesController],
      providers: [ShippingGuidesService],
    }).compile();

    controller = module.get<ShippingGuidesController>(ShippingGuidesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
