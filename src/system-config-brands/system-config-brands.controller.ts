import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { SystemConfigBrandsService } from './system-config-brands.service';
import { CreateSystemConfigBrandDto } from './dto/create-system-config-brand.dto';
import { UpdateSystemConfigBrandDto } from './dto/update-system-config-brand.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('system-config-brands')
export class SystemConfigBrandsController {
  constructor(private readonly systemConfigBrandsService: SystemConfigBrandsService) { }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('logo'))
  create(
    @Body() createSystemConfigBrandDto: CreateSystemConfigBrandDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.systemConfigBrandsService.create(createSystemConfigBrandDto, file, user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.systemConfigBrandsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id') id: string
  ) {
    return this.systemConfigBrandsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('logo'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSystemConfigBrandDto: UpdateSystemConfigBrandDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.systemConfigBrandsService.update(id, updateSystemConfigBrandDto, file, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.systemConfigBrandsService.remove(id);
  }
}
