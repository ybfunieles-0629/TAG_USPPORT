import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(@Query() paginationDto: PaginationDto) {
    return this.clientsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  // @Patch('/coorporative/:id')
  // changeIsCoorporative(
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   return this.clientsService.changeIsCoorporative(id);
  // }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.remove(id);
  }
}
