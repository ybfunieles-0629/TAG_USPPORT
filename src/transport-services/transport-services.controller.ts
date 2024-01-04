import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TransportServicesService } from './transport-services.service';
import { CreateTransportServiceDto } from './dto/create-transport-service.dto';
import { UpdateTransportServiceDto } from './dto/update-transport-service.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('transport-services')
export class TransportServicesController {
  constructor(private readonly transportServicesService: TransportServicesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createTransportServiceDto: CreateTransportServiceDto
  ) {
    return this.transportServicesService.create(createTransportServiceDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.transportServicesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.transportServicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransportServiceDto: UpdateTransportServiceDto
  ) {
    return this.transportServicesService.update(id, updateTransportServiceDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.transportServicesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.transportServicesService.remove(id);
  }
}
