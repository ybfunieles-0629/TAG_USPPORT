import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigOffersController } from './system-config-offers.controller';
import { SystemConfigOffersService } from './system-config-offers.service';

describe('SystemConfigOffersController', () => {
  let controller: SystemConfigOffersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemConfigOffersController],
      providers: [SystemConfigOffersService],
    }).compile();

    controller = module.get<SystemConfigOffersController>(SystemConfigOffersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
