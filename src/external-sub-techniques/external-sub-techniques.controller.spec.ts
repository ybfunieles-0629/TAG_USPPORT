import { Test, TestingModule } from '@nestjs/testing';
import { ExternalSubTechniquesController } from './external-sub-techniques.controller';
import { ExternalSubTechniquesService } from './external-sub-techniques.service';

describe('ExternalSubTechniquesController', () => {
  let controller: ExternalSubTechniquesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalSubTechniquesController],
      providers: [ExternalSubTechniquesService],
    }).compile();

    controller = module.get<ExternalSubTechniquesController>(ExternalSubTechniquesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
