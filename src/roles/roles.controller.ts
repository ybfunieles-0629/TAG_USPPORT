import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AssignToRoleDto } from './dto/assign-to-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Patch('/permissions/assign/:id')
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignToRoleDto: AssignToRoleDto
  ) {
    return this.rolesService.assignPermissions(id, assignToRoleDto);
  }

  @Patch('/privileges/assign/:id')
  assignPrivileges(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignToRoleDto: AssignToRoleDto
  ) {
    return this.rolesService.assignPrivileges(id, assignToRoleDto);
  }


  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.rolesService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string
  ) {
    return this.rolesService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rolesService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
