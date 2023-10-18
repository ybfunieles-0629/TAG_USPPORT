import { Test, TestingModule } from '@nestjs/testing';
import { TagDisccountPricesController } from './tag-disccount-prices.controller';
import { TagDisccountPricesService } from './tag-disccount-prices.service';

describe('TagDisccountPricesController', () => {
  let controller: TagDisccountPricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagDisccountPricesController],
      providers: [TagDisccountPricesService],
    }).compile();

    controller = module.get<TagDisccountPricesController>(TagDisccountPricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
