import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) { }

  @Post()
  @UseInterceptors(FileInterceptor('portfolio'))
  create(
    @Body() createSupplierDto: CreateSupplierDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.suppliersService.create(createSupplierDto, file);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.suppliersService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.suppliersService.findOne(term);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('portfolio'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.suppliersService.update(id, updateSupplierDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
