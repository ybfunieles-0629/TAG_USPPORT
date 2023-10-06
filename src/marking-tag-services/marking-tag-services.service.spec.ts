import { Test, TestingModule } from '@nestjs/testing';
import { MarkingTagServicesService } from './marking-tag-services.service';

describe('MarkingTagServicesService', () => {
  let service: MarkingTagServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarkingTagServicesService],
    }).compile();

    service = module.get<MarkingTagServicesService>(MarkingTagServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
