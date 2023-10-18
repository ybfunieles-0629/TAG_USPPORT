import { Test, TestingModule } from '@nestjs/testing';
import { ListPricesController } from './list-prices.controller';
import { ListPricesService } from './list-prices.service';

describe('ListPricesController', () => {
  let controller: ListPricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListPricesController],
      providers: [ListPricesService],
    }).compile();

    controller = module.get<ListPricesController>(ListPricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
