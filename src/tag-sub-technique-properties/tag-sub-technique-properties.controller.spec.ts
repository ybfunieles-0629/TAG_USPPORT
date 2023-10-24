import { Test, TestingModule } from '@nestjs/testing';
import { TagSubTechniquePropertiesController } from './tag-sub-technique-properties.controller';
import { TagSubTechniquePropertiesService } from './tag-sub-technique-properties.service';

describe('TagSubTechniquePropertiesController', () => {
  let controller: TagSubTechniquePropertiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagSubTechniquePropertiesController],
      providers: [TagSubTechniquePropertiesService],
    }).compile();

    controller = module.get<TagSubTechniquePropertiesController>(TagSubTechniquePropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
