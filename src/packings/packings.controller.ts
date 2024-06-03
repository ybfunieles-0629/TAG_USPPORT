import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PackingsService } from './packings.service';
import { CreatePackingDto } from './dto/create-packing.dto';
import { UpdatePackingDto } from './dto/update-packing.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('packings')
export class PackingsController {
  constructor(private readonly packingsService: PackingsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createPackingDto: CreatePackingDto,
    @GetUser() user: User,
    ) {
    return this.packingsService.create(createPackingDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.packingsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePackingDto: UpdatePackingDto,
    @GetUser() user: User,
  ) {
    return this.packingsService.update(id, updatePackingDto, user);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.packingsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packingsService.remove(id);
  }






  // Actuaizar paquetes de las apis
  @Post('/loadPacking')
  loadProducts(
    @Query('supplier') supplier: string,
  ) {
    return this.packingsService.loadPakingSupplier(supplier);
  }


  
}
