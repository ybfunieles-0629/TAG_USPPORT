import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarkedServicePricesService } from './marked-service-prices.service';
import { CreateMarkedServicePriceDto } from './dto/create-marked-service-price.dto';
import { UpdateMarkedServicePriceDto } from './dto/update-marked-service-price.dto';

@Controller('marked-service-prices')
export class MarkedServicePricesController {
  constructor(private readonly markedServicePricesService: MarkedServicePricesService) {}

  @Post()
  create(@Body() createMarkedServicePriceDto: CreateMarkedServicePriceDto) {
    return this.markedServicePricesService.create(createMarkedServicePriceDto);
  }

  @Get()
  findAll() {
    return this.markedServicePricesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.markedServicePricesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkedServicePriceDto: UpdateMarkedServicePriceDto) {
    return this.markedServicePricesService.update(+id, updateMarkedServicePriceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markedServicePricesService.remove(+id);
  }
}
