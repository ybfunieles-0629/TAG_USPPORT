import { Test, TestingModule } from '@nestjs/testing';
import { MarkingServicePropertiesController } from './marking-service-properties.controller';
import { MarkingServicePropertiesService } from './marking-service-properties.service';

describe('MarkingServicePropertiesController', () => {
  let controller: MarkingServicePropertiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarkingServicePropertiesController],
      providers: [MarkingServicePropertiesService],
    }).compile();

    controller = module.get<MarkingServicePropertiesController>(MarkingServicePropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
