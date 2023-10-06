import { Test, TestingModule } from '@nestjs/testing';
import { MarkingTagServicesController } from './marking-tag-services.controller';
import { MarkingTagServicesService } from './marking-tag-services.service';

describe('MarkingTagServicesController', () => {
  let controller: MarkingTagServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarkingTagServicesController],
      providers: [MarkingTagServicesService],
    }).compile();

    controller = module.get<MarkingTagServicesController>(MarkingTagServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
