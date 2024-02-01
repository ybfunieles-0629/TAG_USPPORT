import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { VariantReferenceService } from './variant-reference.service';
import { CreateVariantReferenceDto } from './dto/create-variant-reference.dto';
import { UpdateVariantReferenceDto } from './dto/update-variant-reference.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('variant-reference')
export class VariantReferenceController {
  constructor(private readonly variantReferenceService: VariantReferenceService) { }

  @Post()
  create(@Body() createVariantReferenceDto: CreateVariantReferenceDto) {
    return this.variantReferenceService.create(createVariantReferenceDto);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleVariantReferences: CreateVariantReferenceDto[]
  ) {
    return this.variantReferenceService.createMultiple(createMultipleVariantReferences);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.variantReferenceService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantReferenceService.findOne(id);
  }

  @Get('filter/by/reference/:id')
  @UseGuards(AuthGuard())
  findByProductReference(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantReferenceService.findByProductReference(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVariantReferenceDto: UpdateVariantReferenceDto
  ) {
    return this.variantReferenceService.update(id, updateVariantReferenceDto);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleVariantReferences: UpdateVariantReferenceDto[]
  ) {
    return this.variantReferenceService.updateMultiple(updateMultipleVariantReferences);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantReferenceService.remove(id);
  }
}
