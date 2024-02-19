import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { SwiperHomeService } from './swiper-home.service';
import { CreateSwiperHomeDto } from './dto/create-swiper-home.dto';
import { UpdateSwiperHomeDto } from './dto/update-swiper-home.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('swiper-home')
export class SwiperHomeController {
  constructor(private readonly swiperHomeService: SwiperHomeService) { }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('imageUrl'))
  create(
    @Body() createSwiperHomeDto: CreateSwiperHomeDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.swiperHomeService.create(createSwiperHomeDto, file, user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.swiperHomeService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.swiperHomeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('imageUrl'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSwiperHomeDto: UpdateSwiperHomeDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.swiperHomeService.update(id, updateSwiperHomeDto, file, user);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('imageUrl'))
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.swiperHomeService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.swiperHomeService.remove(id);
  }
}
