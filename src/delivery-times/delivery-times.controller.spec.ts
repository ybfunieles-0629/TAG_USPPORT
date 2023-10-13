import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryTimesController } from './delivery-times.controller';
import { DeliveryTimesService } from './delivery-times.service';

describe('DeliveryTimesController', () => {
  let controller: DeliveryTimesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryTimesController],
      providers: [DeliveryTimesService],
    }).compile();

    controller = module.get<DeliveryTimesController>(DeliveryTimesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
