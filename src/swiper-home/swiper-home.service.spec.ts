import { Test, TestingModule } from '@nestjs/testing';
import { SwiperHomeService } from './swiper-home.service';

describe('SwiperHomeService', () => {
  let service: SwiperHomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwiperHomeService],
    }).compile();

    service = module.get<SwiperHomeService>(SwiperHomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
