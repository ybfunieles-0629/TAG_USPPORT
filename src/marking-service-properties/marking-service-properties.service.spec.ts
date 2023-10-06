import { Test, TestingModule } from '@nestjs/testing';
import { MarkingServicePropertiesService } from './marking-service-properties.service';

describe('MarkingServicePropertiesService', () => {
  let service: MarkingServicePropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarkingServicePropertiesService],
    }).compile();

    service = module.get<MarkingServicePropertiesService>(MarkingServicePropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
