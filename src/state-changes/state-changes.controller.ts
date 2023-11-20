import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';

import { StateChangesService } from './state-changes.service';
import { CreateStateChangeDto } from './dto/create-state-change.dto';
import { UpdateStateChangeDto } from './dto/update-state-change.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('state-changes')
export class StateChangesController {
  constructor(private readonly stateChangesService: StateChangesService) { }

  @Post()
  create(@Body() createStateChangeDto: CreateStateChangeDto) {
    return this.stateChangesService.create(createStateChangeDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.stateChangesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.stateChangesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStateChangeDto: UpdateStateChangeDto
  ) {
    return this.stateChangesService.update(id, updateStateChangeDto);
  }

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stateChangesService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.stateChangesService.remove(id);
  }
}
