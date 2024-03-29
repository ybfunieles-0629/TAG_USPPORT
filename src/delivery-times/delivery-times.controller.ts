import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';

import { DeliveryTimesService } from './delivery-times.service';
import { CreateDeliveryTimeDto } from './dto/create-delivery-time.dto';
import { UpdateDeliveryTimeDto } from './dto/update-delivery-time.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('delivery-times')
export class DeliveryTimesController {
  constructor(private readonly deliveryTimesService: DeliveryTimesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createDeliveryTimeDto: CreateDeliveryTimeDto,
    @GetUser() user: User,
  ) {
    return this.deliveryTimesService.create(createDeliveryTimeDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleDeliveryTimes: CreateDeliveryTimeDto[],
    @GetUser() user: User,
  ) {
    return this.deliveryTimesService.createMultiple(createMultipleDeliveryTimes, user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.deliveryTimesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.deliveryTimesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeliveryTimeDto: UpdateDeliveryTimeDto,
    @GetUser() user: User,
  ) {
    return this.deliveryTimesService.update(id, updateDeliveryTimeDto, user);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleDeliveryTimes: UpdateDeliveryTimeDto[],
    @GetUser() user: User,
  ) {
    return this.deliveryTimesService.updateMultiple(updateMultipleDeliveryTimes, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.deliveryTimesService.remove(id);
  }
}
