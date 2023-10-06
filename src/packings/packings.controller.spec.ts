import { Test, TestingModule } from '@nestjs/testing';
import { PackingsController } from './packings.controller';
import { PackingsService } from './packings.service';

describe('PackingsController', () => {
  let controller: PackingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackingsController],
      providers: [PackingsService],
    }).compile();

    controller = module.get<PackingsController>(PackingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
