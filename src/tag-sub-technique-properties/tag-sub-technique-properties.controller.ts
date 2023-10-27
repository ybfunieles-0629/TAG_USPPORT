import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { TagSubTechniquePropertiesService } from './tag-sub-technique-properties.service';
import { CreateTagSubTechniquePropertyDto } from './dto/create-tag-sub-technique-property.dto';
import { UpdateTagSubTechniquePropertyDto } from './dto/update-tag-sub-technique-property.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('tag-sub-technique-properties')
export class TagSubTechniquePropertiesController {
  constructor(private readonly tagSubTechniquePropertiesService: TagSubTechniquePropertiesService) { }

  @Post()
  create(
    @Body() createTagSubTechniquePropertyDto: CreateTagSubTechniquePropertyDto
  ) {
    return this.tagSubTechniquePropertiesService.create(createTagSubTechniquePropertyDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.tagSubTechniquePropertiesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquePropertiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagSubTechniquePropertyDto: UpdateTagSubTechniquePropertyDto
  ) {
    return this.tagSubTechniquePropertiesService.update(id, updateTagSubTechniquePropertyDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagSubTechniquePropertiesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquePropertiesService.remove(id);
  }
}
