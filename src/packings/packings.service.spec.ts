import { Test, TestingModule } from '@nestjs/testing';
import { PackingsService } from './packings.service';

describe('PackingsService', () => {
  let service: PackingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackingsService],
    }).compile();

    service = module.get<PackingsService>(PackingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
