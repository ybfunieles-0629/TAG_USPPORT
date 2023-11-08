import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';

import { CommercialQualificationService } from './commercial-qualification.service';
import { CreateCommercialQualificationDto } from './dto/create-commercial-qualification.dto';
import { UpdateCommercialQualificationDto } from './dto/update-commercial-qualification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('commercial-qualification')
export class CommercialQualificationController {
  constructor(private readonly commercialQualificationService: CommercialQualificationService) { }

  @Post()
  create(
    @Body() createCommercialQualificationDto: CreateCommercialQualificationDto
  ) {
    return this.commercialQualificationService.create(createCommercialQualificationDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commercialQualificationService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.commercialQualificationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateCommercialQualificationDto: UpdateCommercialQualificationDto
    ) {
    return this.commercialQualificationService.update(id, updateCommercialQualificationDto);
  }

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string, 
    ) {
    return this.commercialQualificationService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
    ) {
    return this.commercialQualificationService.remove(id);
  }
}
