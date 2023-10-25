import { Test, TestingModule } from '@nestjs/testing';
import { ExternalSubTechniquesService } from './external-sub-techniques.service';

describe('ExternalSubTechniquesService', () => {
  let service: ExternalSubTechniquesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalSubTechniquesService],
    }).compile();

    service = module.get<ExternalSubTechniquesService>(ExternalSubTechniquesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
