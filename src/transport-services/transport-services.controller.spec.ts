import { Test, TestingModule } from '@nestjs/testing';
import { TransportServicesController } from './transport-services.controller';
import { TransportServicesService } from './transport-services.service';

describe('TransportServicesController', () => {
  let controller: TransportServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransportServicesController],
      providers: [TransportServicesService],
    }).compile();

    controller = module.get<TransportServicesController>(TransportServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
