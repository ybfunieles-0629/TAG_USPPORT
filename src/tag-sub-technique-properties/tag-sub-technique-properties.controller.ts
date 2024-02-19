import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TagSubTechniquePropertiesService } from './tag-sub-technique-properties.service';
import { CreateTagSubTechniquePropertyDto } from './dto/create-tag-sub-technique-property.dto';
import { UpdateTagSubTechniquePropertyDto } from './dto/update-tag-sub-technique-property.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('tag-sub-technique-properties')
export class TagSubTechniquePropertiesController {
  constructor(private readonly tagSubTechniquePropertiesService: TagSubTechniquePropertiesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createTagSubTechniquePropertyDto: CreateTagSubTechniquePropertyDto,
    @GetUser() user: User,
  ) {
    return this.tagSubTechniquePropertiesService.create(createTagSubTechniquePropertyDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createTagSubTechniqueProperties: CreateTagSubTechniquePropertyDto[],
    @GetUser() user: User,
  ) {
    return this.tagSubTechniquePropertiesService.createMultiple(createTagSubTechniqueProperties, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.tagSubTechniquePropertiesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquePropertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagSubTechniquePropertyDto: UpdateTagSubTechniquePropertyDto,
    @GetUser() user: User,
  ) {
    return this.tagSubTechniquePropertiesService.update(id, updateTagSubTechniquePropertyDto, user);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateTagSubTechniqueProperties: UpdateTagSubTechniquePropertyDto[],
    @GetUser() user: User,
  ) {
    return this.tagSubTechniquePropertiesService.updateMultiple(updateTagSubTechniqueProperties, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagSubTechniquePropertiesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.tagSubTechniquePropertiesService.remove(id);
  }
}
