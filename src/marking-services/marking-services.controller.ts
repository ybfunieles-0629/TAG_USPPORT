import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MarkingServicesService } from './marking-services.service';
import { CreateMarkingServiceDto } from './dto/create-marking-service.dto';
import { UpdateMarkingServiceDto } from './dto/update-marking-service.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('marking-services')
export class MarkingServicesController {
  constructor(private readonly markingServicesService: MarkingServicesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createMarkingServiceDto: CreateMarkingServiceDto,
    @GetUser() user: User,
  ) {
    return this.markingServicesService.create(createMarkingServiceDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMarkingServices: CreateMarkingServiceDto[],
    @GetUser() user: User,
    @Query('quoteDetail') quoteDetail: string,

  ) {
    return this.markingServicesService.createMultiple(createMarkingServices, user, quoteDetail);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.markingServicesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingServicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingServiceDto: UpdateMarkingServiceDto,
    @GetUser() user: User,
  ) {
    return this.markingServicesService.update(id, updateMarkingServiceDto, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingServicesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingServicesService.remove(id);
  }
}
