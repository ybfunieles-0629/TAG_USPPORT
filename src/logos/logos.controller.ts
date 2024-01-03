import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseUUIDPipe, Query, UploadedFiles, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { LogosService } from './logos.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('logos')
export class LogosController {
  constructor(private readonly logosService: LogosService) { }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'mounting', maxCount: 1 },
    ])
  )
  create(
    @Body() createLogoDto: CreateLogoDto,
    @UploadedFiles() files: Record<string, Express.Multer.File>
  ) {
    return this.logosService.create(createLogoDto, files);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.logosService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.logosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'mounting', maxCount: 1 },
    ])
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLogoDto: UpdateLogoDto,
    @UploadedFiles() files: Record<string, Express.Multer.File>
  ) {
    return this.logosService.update(id, updateLogoDto, files);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.logosService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.logosService.remove(id);
  }
}
