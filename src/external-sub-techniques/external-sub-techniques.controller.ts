import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { ExternalSubTechniquesService } from './external-sub-techniques.service';
import { CreateExternalSubTechniqueDto } from './dto/create-external-sub-technique.dto';
import { UpdateExternalSubTechniqueDto } from './dto/update-external-sub-technique.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('external-sub-techniques')
export class ExternalSubTechniquesController {
  constructor(private readonly externalSubTechniquesService: ExternalSubTechniquesService) { }

  @Post()
  create(
    @Body() createExternalSubTechniqueDto: CreateExternalSubTechniqueDto
  ) {
    return this.externalSubTechniquesService.create(createExternalSubTechniqueDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.externalSubTechniquesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.externalSubTechniquesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExternalSubTechniqueDto: UpdateExternalSubTechniqueDto
  ) {
    return this.externalSubTechniquesService.update(id, updateExternalSubTechniqueDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.externalSubTechniquesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.externalSubTechniquesService.remove(id);
  }
}
