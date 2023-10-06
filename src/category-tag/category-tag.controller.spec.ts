import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTagController } from './category-tag.controller';
import { CategoryTagService } from './category-tag.service';

describe('CategoryTagController', () => {
  let controller: CategoryTagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryTagController],
      providers: [CategoryTagService],
    }).compile();

    controller = module.get<CategoryTagController>(CategoryTagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
