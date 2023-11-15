import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SwiperHomeService } from './swiper-home.service';
import { CreateSwiperHomeDto } from './dto/create-swiper-home.dto';
import { UpdateSwiperHomeDto } from './dto/update-swiper-home.dto';

@Controller('swiper-home')
export class SwiperHomeController {
  constructor(private readonly swiperHomeService: SwiperHomeService) {}

  @Post()
  create(@Body() createSwiperHomeDto: CreateSwiperHomeDto) {
    return this.swiperHomeService.create(createSwiperHomeDto);
  }

  @Get()
  findAll() {
    return this.swiperHomeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.swiperHomeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSwiperHomeDto: UpdateSwiperHomeDto) {
    return this.swiperHomeService.update(+id, updateSwiperHomeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.swiperHomeService.remove(+id);
  }
}
