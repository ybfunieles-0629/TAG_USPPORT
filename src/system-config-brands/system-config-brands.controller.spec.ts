import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigBrandsController } from './system-config-brands.controller';
import { SystemConfigBrandsService } from './system-config-brands.service';

describe('SystemConfigBrandsController', () => {
  let controller: SystemConfigBrandsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemConfigBrandsController],
      providers: [SystemConfigBrandsService],
    }).compile();

    controller = module.get<SystemConfigBrandsController>(SystemConfigBrandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
