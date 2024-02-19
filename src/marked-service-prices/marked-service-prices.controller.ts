import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MarkedServicePricesService } from './marked-service-prices.service';
import { CreateMarkedServicePriceDto } from './dto/create-marked-service-price.dto';
import { UpdateMarkedServicePriceDto } from './dto/update-marked-service-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('marked-service-prices')
export class MarkedServicePricesController {
  constructor(private readonly markedServicePricesService: MarkedServicePricesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createMarkedServicePriceDto: CreateMarkedServicePriceDto,
    @GetUser() user: User,
  ) {
    return this.markedServicePricesService.create(createMarkedServicePriceDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMarkedServicePrices: CreateMarkedServicePriceDto[],
    @GetUser() user: User,
  ) {
    return this.markedServicePricesService.createMultiple(createMarkedServicePrices, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.markedServicePricesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markedServicePricesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkedServicePriceDto: UpdateMarkedServicePriceDto,
    @GetUser() user: User,
  ) {
    return this.markedServicePricesService.update(id, updateMarkedServicePriceDto, user);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMarkedServicePrices: UpdateMarkedServicePriceDto[],
    @GetUser() user: User,
  ) {
    return this.markedServicePricesService.updateMultiple(updateMarkedServicePrices, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.markedServicePricesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markedServicePricesService.remove(id);
  }
}
