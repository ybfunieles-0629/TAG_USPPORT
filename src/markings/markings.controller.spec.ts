import { Test, TestingModule } from '@nestjs/testing';
import { MarkingsController } from './markings.controller';
import { MarkingsService } from './markings.service';

describe('MarkingsController', () => {
  let controller: MarkingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarkingsController],
      providers: [MarkingsService],
    }).compile();

    controller = module.get<MarkingsController>(MarkingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
