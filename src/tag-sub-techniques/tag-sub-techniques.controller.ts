import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { TagSubTechniquesService } from './tag-sub-techniques.service';
import { CreateTagSubTechniqueDto } from './dto/create-tag-sub-technique.dto';
import { UpdateTagSubTechniqueDto } from './dto/update-tag-sub-technique.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('tag-sub-techniques')
export class TagSubTechniquesController {
  constructor(private readonly tagSubTechniquesService: TagSubTechniquesService) { }

  @Post()
  create(@Body() createTagSubTechniqueDto: CreateTagSubTechniqueDto) {
    return this.tagSubTechniquesService.create(createTagSubTechniqueDto);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto,
  ) {
    return this.tagSubTechniquesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagSubTechniqueDto: UpdateTagSubTechniqueDto
  ) {
    return this.tagSubTechniquesService.update(id, updateTagSubTechniqueDto);
  }

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagSubTechniquesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquesService.remove(id);
  }
}
