import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TagSubTechniquesService } from './tag-sub-techniques.service';
import { CreateTagSubTechniqueDto } from './dto/create-tag-sub-technique.dto';
import { UpdateTagSubTechniqueDto } from './dto/update-tag-sub-technique.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('tag-sub-techniques')
export class TagSubTechniquesController {
  constructor(private readonly tagSubTechniquesService: TagSubTechniquesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createTagSubTechniqueDto: CreateTagSubTechniqueDto) {
    return this.tagSubTechniquesService.create(createTagSubTechniqueDto);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createTagSubTechniques: CreateTagSubTechniqueDto[]
    ) {
    return this.tagSubTechniquesService.createMultiple(createTagSubTechniques);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.tagSubTechniquesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagSubTechniqueDto: UpdateTagSubTechniqueDto
  ) {
    return this.tagSubTechniquesService.update(id, updateTagSubTechniqueDto);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateTagSubTechniques: UpdateTagSubTechniqueDto[]
  ) {
    return this.tagSubTechniquesService.updateMultiple(updateTagSubTechniques);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagSubTechniquesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquesService.remove(id);
  }
}
