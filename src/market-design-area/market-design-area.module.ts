import { Module } from '@nestjs/common';
import { MarketDesignAreaService } from './market-design-area.service';
import { MarketDesignAreaController } from './market-design-area.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDesignArea } from './entities/market-design-area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketDesignArea])
  ],
  controllers: [MarketDesignAreaController],
  providers: [MarketDesignAreaService],
  exports: [TypeOrmModule, MarketDesignAreaService],
})
export class MarketDesignAreaModule {}
