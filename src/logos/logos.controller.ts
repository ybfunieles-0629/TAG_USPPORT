import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LogosService } from './logos.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('logos')
export class LogosController {
  constructor(private readonly logosService: LogosService) { }

  @Post()
  @UseInterceptors(FileInterceptor('url'))
  create(
    @Body() createLogoDto: CreateLogoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.logosService.create(createLogoDto, file);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.logosService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.logosService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('url'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLogoDto: UpdateLogoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.logosService.update(id, updateLogoDto, file);
  }

  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.logosService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.logosService.remove(id);
  }
}
