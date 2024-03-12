import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { SwiperHomeService } from './swiper-home.service';
import { SwiperHomeController } from './swiper-home.controller';
import { SwiperHome } from './entities/swiper-home.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([SwiperHome]),
  ],
  controllers: [SwiperHomeController],
  providers: [SwiperHomeService],
  exports: [TypeOrmModule, SwiperHomeService],
})
export class SwiperHomeModule {}
