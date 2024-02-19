import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LocalTransportPricesService } from './local-transport-prices.service';
import { CreateLocalTransportPriceDto } from './dto/create-local-transport-price.dto';
import { UpdateLocalTransportPriceDto } from './dto/update-local-transport-price.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('local-transport-prices')
export class LocalTransportPricesController {
  constructor(private readonly localTransportPricesService: LocalTransportPricesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createLocalTransportPriceDto: CreateLocalTransportPriceDto,
    @GetUser() user: User,
  ) {
    return this.localTransportPricesService.create(createLocalTransportPriceDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createLocalTransportPrices: CreateLocalTransportPriceDto[],
    @GetUser() user: User,
  ) {
    return this.localTransportPricesService.createMultiple(createLocalTransportPrices, user);
  }


  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.localTransportPricesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocalTransportPriceDto: UpdateLocalTransportPriceDto,
    @GetUser() user: User,
  ) {
    return this.localTransportPricesService.update(id, updateLocalTransportPriceDto, user);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateLocalTransportPrices: UpdateLocalTransportPriceDto[],
    @GetUser() user: User,
  ) {
    return this.localTransportPricesService.updateMultiple(updateLocalTransportPrices, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.localTransportPricesService.remove(id);
  }
}
