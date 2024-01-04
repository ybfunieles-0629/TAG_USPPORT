import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StatesService } from './states.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createStateDto: CreateStateDto) {
    return this.statesService.create(createStateDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.statesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.statesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStateDto: UpdateStateDto
  ) {
    return this.statesService.update(id, updateStateDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.statesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.statesService.remove(id);
  }
}
