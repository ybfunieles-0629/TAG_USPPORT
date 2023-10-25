import { Test, TestingModule } from '@nestjs/testing';
import { MarkingServicesController } from './marking-services.controller';
import { MarkingServicesService } from './marking-services.service';

describe('MarkingServicesController', () => {
  let controller: MarkingServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarkingServicesController],
      providers: [MarkingServicesService],
    }).compile();

    controller = module.get<MarkingServicesController>(MarkingServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
