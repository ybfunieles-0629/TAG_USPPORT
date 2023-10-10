import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { MarketDesignAreaService } from './market-design-area.service';
import { CreateMarketDesignAreaDto } from './dto/create-market-design-area.dto';
import { UpdateMarketDesignAreaDto } from './dto/update-market-design-area.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('market-design-area')
export class MarketDesignAreaController {
  constructor(private readonly marketDesignAreaService: MarketDesignAreaService) { }

  @Post()
  create(@Body() createMarketDesignAreaDto: CreateMarketDesignAreaDto) {
    return this.marketDesignAreaService.create(createMarketDesignAreaDto);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.marketDesignAreaService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketDesignAreaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarketDesignAreaDto: UpdateMarketDesignAreaDto
  ) {
    return this.marketDesignAreaService.update(id, updateMarketDesignAreaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketDesignAreaService.remove(id);
  }
}
