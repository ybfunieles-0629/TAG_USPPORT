import { Test, TestingModule } from '@nestjs/testing';
import { QuoteDetailsController } from './quote-details.controller';
import { QuoteDetailsService } from './quote-details.service';

describe('QuoteDetailsController', () => {
  let controller: QuoteDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteDetailsController],
      providers: [QuoteDetailsService],
    }).compile();

    controller = module.get<QuoteDetailsController>(QuoteDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
