import { Test, TestingModule } from '@nestjs/testing';
import { VariantReferenceController } from './variant-reference.controller';
import { VariantReferenceService } from './variant-reference.service';

describe('VariantReferenceController', () => {
  let controller: VariantReferenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariantReferenceController],
      providers: [VariantReferenceService],
    }).compile();

    controller = module.get<VariantReferenceController>(VariantReferenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
