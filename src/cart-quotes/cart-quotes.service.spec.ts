import { Test, TestingModule } from '@nestjs/testing';
import { CartQuotesService } from './cart-quotes.service';

describe('CartQuotesService', () => {
  let service: CartQuotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartQuotesService],
    }).compile();

    service = module.get<CartQuotesService>(CartQuotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
