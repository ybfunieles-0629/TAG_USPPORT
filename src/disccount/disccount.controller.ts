import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DisccountService } from './disccount.service';
import { CreateDisccountDto } from './dto/create-disccount.dto';
import { UpdateDisccountDto } from './dto/update-disccount.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('disccount')
export class DisccountController {
  constructor(private readonly disccountService: DisccountService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createDisccountDto: CreateDisccountDto) {
    return this.disccountService.create(createDisccountDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.disccountService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.disccountService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisccountDto: UpdateDisccountDto
  ) {
    return this.disccountService.update(id, updateDisccountDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disccountService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.disccountService.remove(id);
  }
}
