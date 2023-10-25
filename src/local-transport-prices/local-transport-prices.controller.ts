import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocalTransportPricesService } from './local-transport-prices.service';
import { CreateLocalTransportPriceDto } from './dto/create-local-transport-price.dto';
import { UpdateLocalTransportPriceDto } from './dto/update-local-transport-price.dto';

@Controller('local-transport-prices')
export class LocalTransportPricesController {
  constructor(private readonly localTransportPricesService: LocalTransportPricesService) {}

  @Post()
  create(@Body() createLocalTransportPriceDto: CreateLocalTransportPriceDto) {
    return this.localTransportPricesService.create(createLocalTransportPriceDto);
  }

  @Get()
  findAll() {
    return this.localTransportPricesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localTransportPricesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocalTransportPriceDto: UpdateLocalTransportPriceDto) {
    return this.localTransportPricesService.update(+id, updateLocalTransportPriceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.localTransportPricesService.remove(+id);
  }
}
