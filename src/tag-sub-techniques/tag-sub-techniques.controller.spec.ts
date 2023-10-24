import { Test, TestingModule } from '@nestjs/testing';
import { TagSubTechniquesController } from './tag-sub-techniques.controller';
import { TagSubTechniquesService } from './tag-sub-techniques.service';

describe('TagSubTechniquesController', () => {
  let controller: TagSubTechniquesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagSubTechniquesController],
      providers: [TagSubTechniquesService],
    }).compile();

    controller = module.get<TagSubTechniquesController>(TagSubTechniquesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
