import { Test, TestingModule } from '@nestjs/testing';
import { CommercialQualificationService } from './commercial-qualification.service';

describe('CommercialQualificationService', () => {
  let service: CommercialQualificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommercialQualificationService],
    }).compile();

    service = module.get<CommercialQualificationService>(CommercialQualificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
