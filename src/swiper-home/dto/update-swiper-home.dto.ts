import { PartialType } from '@nestjs/swagger';
import { CreateSwiperHomeDto } from './create-swiper-home.dto';

export class UpdateSwiperHomeDto extends PartialType(CreateSwiperHomeDto) {}
