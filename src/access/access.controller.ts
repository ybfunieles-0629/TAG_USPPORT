// import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

// import { AccessService } from './access.service';
// import { LoginUserDto } from './dto/login-user.dto';
// import { CreateUserDto } from '../users/dto/create-user.dto';
// import { PaginationDto } from '../common/dto/pagination.dto';
// import { CreateClientDto } from '../clients/dto/create-client.dto';

// @Controller('access')
// export class AccessController {
//   constructor(
//     private readonly accessService: AccessService
//   ) { }

//   @Get()
//   findAll(
//     @Query() paginationDto: PaginationDto
//   ) {
//     return this.accessService.findAll(paginationDto);
//   }

//   @Patch('/permissions/assign/:id')
//   assignPermissions(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() assignPermissionsDto: AssignPermissionsDto,
//   ) {
//     return this.accessService.assignPermissions(id, assignPermissionsDto);
//   }
  
//   @Patch('/privileges/assign/:id')
//   assignPrivileges(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() assignPrivilegesDto: AssignPrivilegesDto,
//   ) {
//     return this.accessService.assignPrivileges(id, assignPrivilegesDto);
//   }

//   @Post('signup')
//   create(
//     @Body() createClientDto: CreateClientDto
//   ) {
//     return this.accessService.signup(createClientDto);
//   }

//   @Post('create/user')
//   createUser(
//     @Body() createUserDto: CreateUserDto
//   ) {
//     return this.accessService.createUser(createUserDto);
//   }

//   @Post('login')
//   login(
//     @Body() loginUserDto: LoginUserDto
//   ) {
//     return this.accessService.login(loginUserDto);
//   }

//   @Patch('/roles/assign/:id')
//   assignRoles(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() assignRolesDto: AssignRolesDto,
//   ) {
//     return this.accessService.assignRolesToAccess(id, assignRolesDto);
//   }
// }
