import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StateChangesService } from './state-changes.service';
import { CreateStateChangeDto } from './dto/create-state-change.dto';
import { UpdateStateChangeDto } from './dto/update-state-change.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('state-changes')
export class StateChangesController {
  constructor(private readonly stateChangesService: StateChangesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createStateChangeDto: CreateStateChangeDto,
    @GetUser() user: User,
  ) {
    return this.stateChangesService.create(createStateChangeDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.stateChangesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.stateChangesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStateChangeDto: UpdateStateChangeDto,
    @GetUser() user: User,
  ) {
    return this.stateChangesService.update(id, updateStateChangeDto, user);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stateChangesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.stateChangesService.remove(id);
  }
}
