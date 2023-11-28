import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseUUIDPipe, Query, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

import { LogosService } from './logos.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('logos')
export class LogosController {
  constructor(private readonly logosService: LogosService) { }

  @Post()
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
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.logosService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.logosService.findOne(id);
  }

  @Patch(':id')
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
