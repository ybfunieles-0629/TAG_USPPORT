import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { AccessService } from './access.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateClientDto } from 'src/clients/dto/create-client.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Controller('access')
export class AccessController {
  constructor(
    private readonly accessService: AccessService
  ) { }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.accessService.findAll(paginationDto);
  }

  @Post('signup')
  create(
    @Body() createClientDto: CreateClientDto
  ) {
    return this.accessService.signup(createClientDto);
  }

  @Post('create/user')
  createUser(
    @Body() createUserDto: CreateUserDto
  ) {
    return this.accessService.createUser(createUserDto);
  }

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto
  ) {
    return this.accessService.login(loginUserDto);
  }

  @Patch('/roles/assign/:id')
  assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.accessService.assignRolesToAccess(id, assignRolesDto);
  }
}
