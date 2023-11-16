import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AssignClientsDto } from './dto/assign-clients.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('/seed')
  seedUsers(

  ) {
    return this.usersService.seedUsers();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto
  ) {
    return this.usersService.login(loginUserDto);
  }

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
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('role/:role')
  findByRole(
    @Param() role: string,
  ) {
    return this.usersService.findByRole(role);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string
  ) {
    return this.usersService.findOne(term);
  }

  @Patch(':id')
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
  changeIsAllowedStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.usersService.changeIsAllowedStatus(id);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
