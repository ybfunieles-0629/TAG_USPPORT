import { Test, TestingModule } from '@nestjs/testing';
import { QuoteDetailsService } from './quote-details.service';

describe('QuoteDetailsService', () => {
  let service: QuoteDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoteDetailsService],
    }).compile();

    service = module.get<QuoteDetailsService>(QuoteDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
