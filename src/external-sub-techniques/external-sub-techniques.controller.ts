import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';

import { ExternalSubTechniquesService } from './external-sub-techniques.service';
import { CreateExternalSubTechniqueDto } from './dto/create-external-sub-technique.dto';
import { UpdateExternalSubTechniqueDto } from './dto/update-external-sub-technique.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('external-sub-techniques')
export class ExternalSubTechniquesController {
  constructor(private readonly externalSubTechniquesService: ExternalSubTechniquesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createExternalSubTechniqueDto: CreateExternalSubTechniqueDto
  ) {
    return this.externalSubTechniquesService.create(createExternalSubTechniqueDto);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createExternalSubTechniques: CreateExternalSubTechniqueDto[]
  ) {
    return this.externalSubTechniquesService.createMultiple(createExternalSubTechniques);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.externalSubTechniquesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.externalSubTechniquesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExternalSubTechniqueDto: UpdateExternalSubTechniqueDto
  ) {
    return this.externalSubTechniquesService.update(id, updateExternalSubTechniqueDto);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateExternalSubTechniques: UpdateExternalSubTechniqueDto[]
  ) {
    return this.externalSubTechniquesService.updateMultiple(updateExternalSubTechniques);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.externalSubTechniquesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.externalSubTechniquesService.remove(id);
  }
}
