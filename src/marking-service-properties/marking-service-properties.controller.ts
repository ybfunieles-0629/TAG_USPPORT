import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { MarkingServicePropertiesService } from './marking-service-properties.service';
import { CreateMarkingServicePropertyDto } from './dto/create-marking-service-property.dto';
import { UpdateMarkingServicePropertyDto } from './dto/update-marking-service-property.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('marking-service-properties')
export class MarkingServicePropertiesController {
  constructor(private readonly markingServicePropertiesService: MarkingServicePropertiesService) { }

  @Post()
  create(@Body() createMarkingServicePropertyDto: CreateMarkingServicePropertyDto) {
    return this.markingServicePropertiesService.create(createMarkingServicePropertyDto);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.markingServicePropertiesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingServicePropertiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingServicePropertyDto: UpdateMarkingServicePropertyDto
  ) {
    return this.markingServicePropertiesService.update(id, updateMarkingServicePropertyDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingServicePropertiesService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingServicePropertiesService.remove(id);
  }
}
