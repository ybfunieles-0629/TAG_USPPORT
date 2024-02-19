import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SystemConfigsService } from './system-configs.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('system-configs')
export class SystemConfigsController {
  constructor(private readonly systemConfigsService: SystemConfigsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createSystemConfigDto: CreateSystemConfigDto,
    @GetUser() user: User,
  ) {
    return this.systemConfigsService.create(createSystemConfigDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.systemConfigsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.systemConfigsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSystemConfigDto: UpdateSystemConfigDto,
    @GetUser() user: User,
  ) {
    return this.systemConfigsService.update(id, updateSystemConfigDto, user);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.systemConfigsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.systemConfigsService.remove(id);
  }
}
