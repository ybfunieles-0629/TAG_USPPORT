import { Test, TestingModule } from '@nestjs/testing';
import { DisccountsController } from './disccounts.controller';
import { DisccountsService } from './disccounts.service';

describe('DisccountsController', () => {
  let controller: DisccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisccountsController],
      providers: [DisccountsService],
    }).compile();

    controller = module.get<DisccountsController>(DisccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
