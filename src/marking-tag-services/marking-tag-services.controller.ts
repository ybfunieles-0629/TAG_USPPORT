import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';

import { MarkingTagServicesService } from './marking-tag-services.service';
import { CreateMarkingTagServiceDto } from './dto/create-marking-tag-service.dto';
import { UpdateMarkingTagServiceDto } from './dto/update-marking-tag-service.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('marking-tag-services')
export class MarkingTagServicesController {
  constructor(private readonly markingTagServicesService: MarkingTagServicesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createMarkingTagServiceDto: CreateMarkingTagServiceDto) {
    return this.markingTagServicesService.create(createMarkingTagServiceDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.markingTagServicesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingTagServicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingTagServiceDto: UpdateMarkingTagServiceDto
  ) {
    return this.markingTagServicesService.update(id, updateMarkingTagServiceDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingTagServicesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingTagServicesService.remove(id);
  }
}