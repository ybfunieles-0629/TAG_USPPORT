import { Injectable } from '@nestjs/common';
import { CreateSwiperHomeDto } from './dto/create-swiper-home.dto';
import { UpdateSwiperHomeDto } from './dto/update-swiper-home.dto';

@Injectable()
export class SwiperHomeService {
  create(createSwiperHomeDto: CreateSwiperHomeDto) {
    return 'This action adds a new swiperHome';
  }

  findAll() {
    return `This action returns all swiperHome`;
  }

  findOne(id: number) {
    return `This action returns a #${id} swiperHome`;
  }

  update(id: number, updateSwiperHomeDto: UpdateSwiperHomeDto) {
    return `This action updates a #${id} swiperHome`;
  }

  remove(id: number) {
    return `This action removes a #${id} swiperHome`;
  }
}
