import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) { }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('portfolio'))
  create(
    @Body() createSupplierDto: CreateSupplierDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.suppliersService.create(createSupplierDto, file);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.suppliersService.findAll(paginationDto);
  }

  @Get(':term')
  @UseGuards(AuthGuard())
  findOne(@Param('term') term: string) {
    return this.suppliersService.findOne(term);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('portfolio'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.suppliersService.update(id, updateSupplierDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
