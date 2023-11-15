import { Test, TestingModule } from '@nestjs/testing';
import { SwiperHomeController } from './swiper-home.controller';
import { SwiperHomeService } from './swiper-home.service';

describe('SwiperHomeController', () => {
  let controller: SwiperHomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwiperHomeController],
      providers: [SwiperHomeService],
    }).compile();

    controller = module.get<SwiperHomeController>(SwiperHomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
