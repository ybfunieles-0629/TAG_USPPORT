import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DisccountsService } from './disccounts.service';
import { CreateDisccountsDto } from './dto/create-disccounts.dto';
import { UpdateDisccountsDto } from './dto/update-disccounts.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('disccounts')
export class DisccountsController {
  constructor(private readonly disccountsService: DisccountsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createDisccountsDto: CreateDisccountsDto) {
    return this.disccountsService.create(createDisccountsDto);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleDisccountsDto: CreateDisccountsDto[]
  ) {
    return this.disccountsService.createMultiple(createMultipleDisccountsDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.disccountsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.disccountsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisccountsDto: UpdateDisccountsDto
  ) {
    return this.disccountsService.update(id, updateDisccountsDto);
  }

  @Put('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() udpateMultipleDisccountsDto: UpdateDisccountsDto[]
  ) {
    return this.disccountsService.updateMultiple(udpateMultipleDisccountsDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disccountsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.disccountsService.remove(id);
  }
}
