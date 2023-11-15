import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigsController } from './system-configs.controller';
import { SystemConfigsService } from './system-configs.service';

describe('SystemConfigsController', () => {
  let controller: SystemConfigsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemConfigsController],
      providers: [SystemConfigsService],
    }).compile();

    controller = module.get<SystemConfigsController>(SystemConfigsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
