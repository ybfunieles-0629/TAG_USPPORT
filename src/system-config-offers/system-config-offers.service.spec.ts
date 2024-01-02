import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigOffersService } from './system-config-offers.service';

describe('SystemConfigOffersService', () => {
  let service: SystemConfigOffersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemConfigOffersService],
    }).compile();

    service = module.get<SystemConfigOffersService>(SystemConfigOffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
