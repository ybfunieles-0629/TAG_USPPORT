import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { MarkingServicesService } from './marking-services.service';
import { CreateMarkingServiceDto } from './dto/create-marking-service.dto';
import { UpdateMarkingServiceDto } from './dto/update-marking-service.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('marking-services')
export class MarkingServicesController {
  constructor(private readonly markingServicesService: MarkingServicesService) { }

  @Post()
  create(
    @Body() createMarkingServiceDto: CreateMarkingServiceDto
  ) {
    return this.markingServicesService.create(createMarkingServiceDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.markingServicesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingServicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingServiceDto: UpdateMarkingServiceDto
  ) {
    return this.markingServicesService.update(id, updateMarkingServiceDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingServicesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingServicesService.remove(id);
  }
}
