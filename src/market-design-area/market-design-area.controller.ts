import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarketDesignAreaService } from './market-design-area.service';
import { CreateMarketDesignAreaDto } from './dto/create-market-design-area.dto';
import { UpdateMarketDesignAreaDto } from './dto/update-market-design-area.dto';

@Controller('market-design-area')
export class MarketDesignAreaController {
  constructor(private readonly marketDesignAreaService: MarketDesignAreaService) {}

  @Post()
  create(@Body() createMarketDesignAreaDto: CreateMarketDesignAreaDto) {
    return this.marketDesignAreaService.create(createMarketDesignAreaDto);
  }

  @Get()
  findAll() {
    return this.marketDesignAreaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketDesignAreaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarketDesignAreaDto: UpdateMarketDesignAreaDto) {
    return this.marketDesignAreaService.update(+id, updateMarketDesignAreaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketDesignAreaService.remove(+id);
  }
}
