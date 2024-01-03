import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TagSubTechniquePropertiesService } from './tag-sub-technique-properties.service';
import { CreateTagSubTechniquePropertyDto } from './dto/create-tag-sub-technique-property.dto';
import { UpdateTagSubTechniquePropertyDto } from './dto/update-tag-sub-technique-property.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('tag-sub-technique-properties')
export class TagSubTechniquePropertiesController {
  constructor(private readonly tagSubTechniquePropertiesService: TagSubTechniquePropertiesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createTagSubTechniquePropertyDto: CreateTagSubTechniquePropertyDto
  ) {
    return this.tagSubTechniquePropertiesService.create(createTagSubTechniquePropertyDto);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createTagSubTechniqueProperties: CreateTagSubTechniquePropertyDto[]
  ) {
    return this.tagSubTechniquePropertiesService.createMultiple(createTagSubTechniqueProperties);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.tagSubTechniquePropertiesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquePropertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagSubTechniquePropertyDto: UpdateTagSubTechniquePropertyDto
  ) {
    return this.tagSubTechniquePropertiesService.update(id, updateTagSubTechniquePropertyDto);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateTagSubTechniqueProperties: UpdateTagSubTechniquePropertyDto[]
  ) {
    return this.tagSubTechniquePropertiesService.updateMultiple(updateTagSubTechniqueProperties);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagSubTechniquePropertiesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquePropertiesService.remove(id);
  }
}
