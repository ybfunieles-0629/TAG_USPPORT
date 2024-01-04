import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CommercialQualificationService } from './commercial-qualification.service';
import { CreateCommercialQualificationDto } from './dto/create-commercial-qualification.dto';
import { UpdateCommercialQualificationDto } from './dto/update-commercial-qualification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('commercial-qualification')
export class CommercialQualificationController {
  constructor(private readonly commercialQualificationService: CommercialQualificationService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createCommercialQualificationDto: CreateCommercialQualificationDto
  ) {
    return this.commercialQualificationService.create(createCommercialQualificationDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commercialQualificationService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.commercialQualificationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateCommercialQualificationDto: UpdateCommercialQualificationDto
    ) {
    return this.commercialQualificationService.update(id, updateCommercialQualificationDto);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string, 
    ) {
    return this.commercialQualificationService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
    ) {
    return this.commercialQualificationService.remove(id);
  }
}
