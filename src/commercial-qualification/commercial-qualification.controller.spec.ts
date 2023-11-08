import { Test, TestingModule } from '@nestjs/testing';
import { CommercialQualificationController } from './commercial-qualification.controller';
import { CommercialQualificationService } from './commercial-qualification.service';

describe('CommercialQualificationController', () => {
  let controller: CommercialQualificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommercialQualificationController],
      providers: [CommercialQualificationService],
    }).compile();

    controller = module.get<CommercialQualificationController>(CommercialQualificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
