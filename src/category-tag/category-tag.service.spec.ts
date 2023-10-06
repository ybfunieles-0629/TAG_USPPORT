import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTagService } from './category-tag.service';

describe('CategoryTagService', () => {
  let service: CategoryTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryTagService],
    }).compile();

    service = module.get<CategoryTagService>(CategoryTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
