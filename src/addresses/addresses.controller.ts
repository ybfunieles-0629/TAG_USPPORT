import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.addressesService.findAll(paginationDto);
  }

  @Get(':term')
  @UseGuards(AuthGuard())
  findOne(@Param('term') term: string) {
    return this.addressesService.findOne(term);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateAddressDto
  ) {
    return this.addressesService.update(id, updateAddressDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.addressesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressesService.remove(id);
  }
}
