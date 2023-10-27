import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { MarkingTagServicesService } from './marking-tag-services.service';
import { CreateMarkingTagServiceDto } from './dto/create-marking-tag-service.dto';
import { UpdateMarkingTagServiceDto } from './dto/update-marking-tag-service.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('marking-tag-services')
export class MarkingTagServicesController {
  constructor(private readonly markingTagServicesService: MarkingTagServicesService) { }

  @Post()
  create(@Body() createMarkingTagServiceDto: CreateMarkingTagServiceDto) {
    return this.markingTagServicesService.create(createMarkingTagServiceDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.markingTagServicesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingTagServicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingTagServiceDto: UpdateMarkingTagServiceDto
  ) {
    return this.markingTagServicesService.update(id, updateMarkingTagServiceDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingTagServicesService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingTagServicesService.remove(id);
  }
}