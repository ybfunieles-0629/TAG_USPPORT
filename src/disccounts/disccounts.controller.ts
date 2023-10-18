import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put } from '@nestjs/common';

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

  @Post('create/multiple')
  createMultiple(
    @Body() createMultipleDisccountsDto: CreateDisccountsDto[]
  ) {
    return this.disccountsService.createMultiple(createMultipleDisccountsDto);
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

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisccountsDto: UpdateDisccountsDto
  ) {
    return this.disccountsService.update(id, updateDisccountsDto);
  }

  @Put('update/multiple')
  updateMultiple(
    @Body() udpateMultipleDisccountsDto: UpdateDisccountsDto[]
  ) {
    return this.disccountsService.updateMultiple(udpateMultipleDisccountsDto);
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
