import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MarkingServicePropertiesService } from './marking-service-properties.service';
import { CreateMarkingServicePropertyDto } from './dto/create-marking-service-property.dto';
import { UpdateMarkingServicePropertyDto } from './dto/update-marking-service-property.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('marking-service-properties')
export class MarkingServicePropertiesController {
  constructor(private readonly markingServicePropertiesService: MarkingServicePropertiesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createMarkingServicePropertyDto: CreateMarkingServicePropertyDto,
    @GetUser() user: User,
  ) {
    return this.markingServicePropertiesService.create(createMarkingServicePropertyDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMarkingServiceProperties: CreateMarkingServicePropertyDto[],
    @GetUser() user: User,
  ) {
    return this.markingServicePropertiesService.createMultiple(createMarkingServiceProperties, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.markingServicePropertiesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingServicePropertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingServicePropertyDto: UpdateMarkingServicePropertyDto,
    @GetUser() user: User,
  ) {
    return this.markingServicePropertiesService.update(id, updateMarkingServicePropertyDto, user);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMarkingServiceProperties: UpdateMarkingServicePropertyDto[],
    @GetUser() user: User,
  ) {
    return this.markingServicePropertiesService.updateMultiple(updateMarkingServiceProperties, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingServicePropertiesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingServicePropertiesService.remove(id);
  }
}
