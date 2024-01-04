import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseInterceptors, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('url'))
  create(
    @Body() createImageDto: CreateImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.create(createImageDto, file);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.imagesService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('url'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateImageDto: UpdateImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.update(id, updateImageDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagesService.remove(id);
  }
}
