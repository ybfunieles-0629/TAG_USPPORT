import { Module } from '@nestjs/common';
import { MarketDesignAreaService } from './market-design-area.service';
import { MarketDesignAreaController } from './market-design-area.controller';

@Module({
  controllers: [MarketDesignAreaController],
  providers: [MarketDesignAreaService],
})
export class MarketDesignAreaModule {}
