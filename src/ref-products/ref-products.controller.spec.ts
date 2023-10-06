import { Test, TestingModule } from '@nestjs/testing';
import { RefProductsController } from './ref-products.controller';
import { RefProductsService } from './ref-products.service';

describe('RefProductsController', () => {
  let controller: RefProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefProductsController],
      providers: [RefProductsService],
    }).compile();

    controller = module.get<RefProductsController>(RefProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
