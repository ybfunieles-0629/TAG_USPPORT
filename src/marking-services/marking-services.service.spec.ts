import { Test, TestingModule } from '@nestjs/testing';
import { MarkingServicesService } from './marking-services.service';

describe('MarkingServicesService', () => {
  let service: MarkingServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarkingServicesService],
    }).compile();

    service = module.get<MarkingServicesService>(MarkingServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
