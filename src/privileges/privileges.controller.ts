import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PrivilegesService } from './privileges.service';
import { CreatePrivilegeDto } from './dto/create-privilege.dto';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('privileges')
export class PrivilegesController {
  constructor(private readonly privilegesService: PrivilegesService) { }

  @Post('/seed')
  seed() {
    return this.privilegesService.seed();
  }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createPrivilegeDto: CreatePrivilegeDto) {
    return this.privilegesService.create(createPrivilegeDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.privilegesService.findAll(paginationDto);
  }

  @Get(':term')
  @UseGuards(AuthGuard())
  findOne(@Param('term') term: string) {
    return this.privilegesService.findOne(term);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePrivilegeDto: UpdatePrivilegeDto
  ) {
    return this.privilegesService.update(id, updatePrivilegeDto);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.privilegesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string) {
    return this.privilegesService.remove(id);
  }
}
