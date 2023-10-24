import { Test, TestingModule } from '@nestjs/testing';
import { TagSubTechniquesService } from './tag-sub-techniques.service';

describe('TagSubTechniquesService', () => {
  let service: TagSubTechniquesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagSubTechniquesService],
    }).compile();

    service = module.get<TagSubTechniquesService>(TagSubTechniquesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
