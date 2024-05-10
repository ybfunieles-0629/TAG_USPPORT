import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createAddressDto: CreateAddressDto,
    @GetUser() user: User,
  ) {
    return this.addressesService.create(createAddressDto, user);
  }



  @Get(':id') // Especificamos que el ID se recibirá como parte de la URL
  @UseGuards(AuthGuard())
  findAll(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.addressesService.findAll(paginationDto, id);
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
    @Body() updateAddressDto: UpdateAddressDto,
    @GetUser() user: User,
  ) {
    return this.addressesService.update(id, updateAddressDto, user);
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
