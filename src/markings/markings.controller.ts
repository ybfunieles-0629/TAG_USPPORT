import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MarkingsService } from './markings.service';
import { CreateMarkingDto } from './dto/create-marking.dto';
import { UpdateMarkingDto } from './dto/update-marking.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('markings')
export class MarkingsController {
  constructor(private readonly markingsService: MarkingsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createMarkingDto: CreateMarkingDto,
    @GetUser() user: User,
  ) {
    return this.markingsService.create(createMarkingDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleMarkings: CreateMarkingDto[],
    @GetUser() user: User,
  ) {
    return this.markingsService.createMultiple(createMultipleMarkings, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.markingsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingDto: UpdateMarkingDto,
    @GetUser() user: User,
  ) {
    return this.markingsService.update(id, updateMarkingDto, user);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleMarkings: UpdateMarkingDto[],
    @GetUser() user: User,
  ) {
    return this.markingsService.updateMultiple(updateMultipleMarkings, user);
  }


  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingsService.remove(id);
  }
}
