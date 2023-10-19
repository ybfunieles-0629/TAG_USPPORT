import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { DeliveryTimesService } from './delivery-times.service';
import { CreateDeliveryTimeDto } from './dto/create-delivery-time.dto';
import { UpdateDeliveryTimeDto } from './dto/update-delivery-time.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('delivery-times')
export class DeliveryTimesController {
  constructor(private readonly deliveryTimesService: DeliveryTimesService) { }

  @Post()
  create(
    @Body() createDeliveryTimeDto: CreateDeliveryTimeDto
  ) {
    return this.deliveryTimesService.create(createDeliveryTimeDto);
  }

  @Post('create/multiple')
  createMultiple(
    @Body() createMultipleDeliveryTimes: CreateDeliveryTimeDto[]
  ) {
    return this.deliveryTimesService.createMultiple(createMultipleDeliveryTimes);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeliveryTimeDto: UpdateDeliveryTimeDto
  ) {
    return this.deliveryTimesService.update(id, updateDeliveryTimeDto);
  }

  @Patch('/update/multiple')
  updateMultiple(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMultipleDeliveryTimes: UpdateDeliveryTimeDto[]
  ) {
    return this.deliveryTimesService.updateMultiple(updateMultipleDeliveryTimes);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.deliveryTimesService.remove(id);
  }
}
