import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { VariantReferenceService } from './variant-reference.service';
import { CreateVariantReferenceDto } from './dto/create-variant-reference.dto';
import { UpdateVariantReferenceDto } from './dto/update-variant-reference.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('variant-reference')
export class VariantReferenceController {
  constructor(private readonly variantReferenceService: VariantReferenceService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createVariantReferenceDto: CreateVariantReferenceDto,
    @GetUser() user: User,
  ) {
    return this.variantReferenceService.create(createVariantReferenceDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleVariantReferences: CreateVariantReferenceDto[],
    @GetUser() user: User,
  ) {
    return this.variantReferenceService.createMultiple(createMultipleVariantReferences, user);
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
    @Body() updateVariantReferenceDto: UpdateVariantReferenceDto,
    @GetUser() user: User,
  ) {
    return this.variantReferenceService.update(id, updateVariantReferenceDto, user);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleVariantReferences: UpdateVariantReferenceDto[],
    @GetUser() user: User,
  ) {
    return this.variantReferenceService.updateMultiple(updateMultipleVariantReferences, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantReferenceService.remove(id);
  }
}
