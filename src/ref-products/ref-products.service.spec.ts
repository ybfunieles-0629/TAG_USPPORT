import { Test, TestingModule } from '@nestjs/testing';
import { RefProductsService } from './ref-products.service';

describe('RefProductsService', () => {
  let service: RefProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefProductsService],
    }).compile();

    service = module.get<RefProductsService>(RefProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
