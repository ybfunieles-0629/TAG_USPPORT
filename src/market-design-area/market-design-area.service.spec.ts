import { Test, TestingModule } from '@nestjs/testing';
import { MarketDesignAreaService } from './market-design-area.service';

describe('MarketDesignAreaService', () => {
  let service: MarketDesignAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketDesignAreaService],
    }).compile();

    service = module.get<MarketDesignAreaService>(MarketDesignAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
