import { Test, TestingModule } from '@nestjs/testing';
import { MarketDesignAreaController } from './market-design-area.controller';
import { MarketDesignAreaService } from './market-design-area.service';

describe('MarketDesignAreaController', () => {
  let controller: MarketDesignAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketDesignAreaController],
      providers: [MarketDesignAreaService],
    }).compile();

    controller = module.get<MarketDesignAreaController>(MarketDesignAreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
