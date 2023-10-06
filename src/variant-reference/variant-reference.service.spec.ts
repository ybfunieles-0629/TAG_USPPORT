import { Test, TestingModule } from '@nestjs/testing';
import { VariantReferenceService } from './variant-reference.service';

describe('VariantReferenceService', () => {
  let service: VariantReferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VariantReferenceService],
    }).compile();

    service = module.get<VariantReferenceService>(VariantReferenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
