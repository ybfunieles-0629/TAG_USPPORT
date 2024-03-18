import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AssignClientsDto } from './dto/assign-clients.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { FilterManyByRolesDto } from './dto/filter-many-by-roles.dto';
import { GetUser } from './decorators/get-user.decorator';
import { Company } from '../companies/entities/company.entity';
import { User } from './entities/user.entity';
import passport from 'passport';
import { ConfirmRegistryDto } from './dto/confirm-registry.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('/seed')
  seedUsers(

  ) {
    return this.usersService.seedUsers();
  }

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Query('externalUser') externalUser: number,
  ) {
    return this.usersService.createUser(createUserDto, externalUser);
  }

  @Post('resend/code')
  resendCode(
    @Body() confirmRegistryDto: ConfirmRegistryDto,
  ) {
    return this.usersService.resendCode(confirmRegistryDto);
  }

  @Post('confirm/account')
  confirmAccount(
    @Body() confirmRegistryDto: ConfirmRegistryDto,
  ) {
    return this.usersService.confirmAccount(confirmRegistryDto);
  };

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto
  ) {
    return this.usersService.login(loginUserDto);
  }

  @Get('refresh/token/:id')
  refreshToken(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.refreshToken(id);
  };

  @Post('password/recovery')
  sendPasswordRecoveryEmail(
    @Body() passwordRecoveryDto: PasswordRecoveryDto
  ) {
    return this.usersService.sendPasswordRecoveryEmail(passwordRecoveryDto);
  }

  @Post('password/change')
  passwordRecovery(
    @Body() passwordRecoveryDto: PasswordRecoveryDto
  ) {
    return this.usersService.passwordRecovery(passwordRecoveryDto);
  }

  @Get()
  // @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('role/:role')
  // @UseGuards(AuthGuard())
  findByRole(
    @Param('role') role: string,
  ) {
    return this.usersService.findByRole(role);
  }

  @Get(':term')
  // @UseGuards(AuthGuard())
  findOne(
    @Param('term') term: string
  ) {
    return this.usersService.findOne(term);
  }

  @Post('filter-by-many/roles')
  // @UseGuards(AuthGuard())
  filterUsersByManyRoles(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
    @Body() roles: FilterManyByRolesDto,
  ) {
    return this.usersService.filterUsersByManyRoles(roles, user, paginationDto)
  }

  @Get('filter-by/secondary-client')
  // @UseGuards(AuthGuard())
  getSecondaryClient(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.getSecondaryClient(user, paginationDto);
  }

  @Get('commercial/clients/:id')
  // @UseGuards(AuthGuard())
  getClientsByCommercial(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.getClientsByCommercial(id);
  }

  @Patch(':id')
  // @UseGuards(AuthGuard())
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // @Patch('/clients/assign/:id')
  // assignClients(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() assignClientsDto: AssignClientsDto,
  // ) {
  //   return this.usersService.assignClients(id, assignClientsDto);
  // }

  @Patch('/allow/:id')
  // @UseGuards(AuthGuard())
  changeIsAllowedStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.usersService.changeIsAllowedStatus(id);
  }

  @Patch('/desactivate/:id')
  // @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.desactivate(id);
  }

  @Patch('/add/permissions/:id')
  // @UseGuards(AuthGuard())
  addPermissionsByUserRole(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.addPermissionsByUserRole(id);
  }

  @Delete(':id')
  // @UseGuards(AuthGuard())
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
