import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { AccessService } from './access.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('access')
export class AccessController {
  constructor(
    private readonly accessService: AccessService
  ) { }

  @Post('signup')
  create(
    @Body() createUserDto: CreateUserDto
  ) {
    return this.accessService.signup(createUserDto);
  }

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto
  ) {
    return this.accessService.login(loginUserDto);
  }
}
