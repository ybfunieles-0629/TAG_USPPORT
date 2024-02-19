import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DisccountsService } from './disccounts.service';
import { CreateDisccountsDto } from './dto/create-disccounts.dto';
import { UpdateDisccountsDto } from './dto/update-disccounts.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('disccounts')
export class DisccountsController {
  constructor(private readonly disccountsService: DisccountsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createDisccountsDto: CreateDisccountsDto,
    @GetUser() user: User,
  ) {
    return this.disccountsService.create(createDisccountsDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleDisccountsDto: CreateDisccountsDto[],
    @GetUser() user: User,
  ) {
    return this.disccountsService.createMultiple(createMultipleDisccountsDto, user);
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
    @Body() updateDisccountsDto: UpdateDisccountsDto,
    @GetUser() user: User,
  ) {
    return this.disccountsService.update(id, updateDisccountsDto, user);
  }

  @Put('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() udpateMultipleDisccountsDto: UpdateDisccountsDto[],
    @GetUser() user: User,
  ) {
    return this.disccountsService.updateMultiple(udpateMultipleDisccountsDto, user);
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
