import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SubSupplierProductTypesService } from './sub-supplier-product-types.service';
import { CreateSubSupplierProductTypeDto } from './dto/create-sub-supplier-product-type.dto';
import { UpdateSubSupplierProductTypeDto } from './dto/update-sub-supplier-product-type.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('sub-supplier-product-types')
export class SubSupplierProductTypesController {
  constructor(private readonly subSupplierProductTypesService: SubSupplierProductTypesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createSubSupplierProductTypeDto: CreateSubSupplierProductTypeDto,
    @GetUser() user: User,
  ) {
    return this.subSupplierProductTypesService.create(createSubSupplierProductTypeDto, user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.subSupplierProductTypesService.findAll(paginationDto);
  }

  @Get(':term')
  @UseGuards(AuthGuard())
  findOne(
    @Param('term') term: string
  ) {
    return this.subSupplierProductTypesService.findOne(term);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubSupplierProductTypeDto: UpdateSubSupplierProductTypeDto,
    @GetUser() user: User,
  ) {
    return this.subSupplierProductTypesService.update(id, updateSubSupplierProductTypeDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string) {
    return this.subSupplierProductTypesService.remove(id);
  }
}
