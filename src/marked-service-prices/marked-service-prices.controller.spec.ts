import { Test, TestingModule } from '@nestjs/testing';
import { MarkedServicePricesController } from './marked-service-prices.controller';
import { MarkedServicePricesService } from './marked-service-prices.service';

describe('MarkedServicePricesController', () => {
  let controller: MarkedServicePricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarkedServicePricesController],
      providers: [MarkedServicePricesService],
    }).compile();

    controller = module.get<MarkedServicePricesController>(MarkedServicePricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
