import { Test, TestingModule } from '@nestjs/testing';
import { LocalTransportPricesController } from './local-transport-prices.controller';
import { LocalTransportPricesService } from './local-transport-prices.service';

describe('LocalTransportPricesController', () => {
  let controller: LocalTransportPricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalTransportPricesController],
      providers: [LocalTransportPricesService],
    }).compile();

    controller = module.get<LocalTransportPricesController>(LocalTransportPricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
