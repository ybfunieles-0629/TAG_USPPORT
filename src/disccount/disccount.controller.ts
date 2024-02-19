import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DisccountService } from './disccount.service';
import { CreateDisccountDto } from './dto/create-disccount.dto';
import { UpdateDisccountDto } from './dto/update-disccount.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('disccount')
export class DisccountController {
  constructor(private readonly disccountService: DisccountService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createDisccountDto: CreateDisccountDto,
    @GetUser() user: User,
  ) {
    return this.disccountService.create(createDisccountDto, user);
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
    @Body() updateDisccountDto: UpdateDisccountDto,
    @GetUser() user: User,
  ) {
    return this.disccountService.update(id, updateDisccountDto, user);
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
