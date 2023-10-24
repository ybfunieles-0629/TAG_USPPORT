import { Test, TestingModule } from '@nestjs/testing';
import { TagSubTechniquePropertiesService } from './tag-sub-technique-properties.service';

describe('TagSubTechniquePropertiesService', () => {
  let service: TagSubTechniquePropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagSubTechniquePropertiesService],
    }).compile();

    service = module.get<TagSubTechniquePropertiesService>(TagSubTechniquePropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
