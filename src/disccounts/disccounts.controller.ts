import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

import { DisccountsService } from './disccounts.service';
import { CreateDisccountsDto } from './dto/create-disccounts.dto';
import { UpdateDisccountsDto } from './dto/update-disccounts.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('disccounts')
export class DisccountsController {
  constructor(private readonly disccountsService: DisccountsService) { }

  @Post()
  create(@Body() createDisccountsDto: CreateDisccountsDto) {
    return this.disccountsService.create(createDisccountsDto);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto,
  ) {
    return this.disccountsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.disccountsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisccountsDto: UpdateDisccountsDto
  ) {
    return this.disccountsService.update(id, updateDisccountsDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disccountsService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.disccountsService.remove(id);
  }
}
