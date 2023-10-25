import { Test, TestingModule } from '@nestjs/testing';
import { CartQuotesController } from './cart-quotes.controller';
import { CartQuotesService } from './cart-quotes.service';

describe('CartQuotesController', () => {
  let controller: CartQuotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartQuotesController],
      providers: [CartQuotesService],
    }).compile();

    controller = module.get<CartQuotesController>(CartQuotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
