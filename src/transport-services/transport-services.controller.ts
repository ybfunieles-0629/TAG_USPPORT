import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { TransportServicesService } from './transport-services.service';
import { CreateTransportServiceDto } from './dto/create-transport-service.dto';
import { UpdateTransportServiceDto } from './dto/update-transport-service.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('transport-services')
export class TransportServicesController {
  constructor(private readonly transportServicesService: TransportServicesService) { }

  @Post()
  create(
    @Body() createTransportServiceDto: CreateTransportServiceDto
  ) {
    return this.transportServicesService.create(createTransportServiceDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.transportServicesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.transportServicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransportServiceDto: UpdateTransportServiceDto
  ) {
    return this.transportServicesService.update(id, updateTransportServiceDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.transportServicesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.transportServicesService.remove(id);
  }
}
