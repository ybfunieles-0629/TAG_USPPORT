import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @UseGuards(AuthGuard())
  @Post('/seed')
  seedAdmins(

  ) {
    return this.adminService.seedAdmins();
  }

  @UseGuards(AuthGuard())
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @UseGuards(AuthGuard())
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.adminService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard())
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.adminService.findOne(term);
  }

  @UseGuards(AuthGuard())
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAdminDto: UpdateAdminDto
  ) {
    return this.adminService.update(id, updateAdminDto);
  }

  @UseGuards(AuthGuard())
  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.adminService.desactivate(id);
  }

  @UseGuards(AuthGuard())
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.remove(id);
  }
}
