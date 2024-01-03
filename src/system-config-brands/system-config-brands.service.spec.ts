import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigBrandsService } from './system-config-brands.service';

describe('SystemConfigBrandsService', () => {
  let service: SystemConfigBrandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemConfigBrandsService],
    }).compile();

    service = module.get<SystemConfigBrandsService>(SystemConfigBrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
