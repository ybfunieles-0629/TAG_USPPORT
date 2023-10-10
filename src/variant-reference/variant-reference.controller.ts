import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';

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

  @Get()
  findAll(paginationDto: PaginationDto) {
    return this.variantReferenceService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantReferenceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVariantReferenceDto: UpdateVariantReferenceDto
  ) {
    return this.variantReferenceService.update(id, updateVariantReferenceDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantReferenceService.remove(id);
  }
}
