import { Test, TestingModule } from '@nestjs/testing';
import { StateChangesController } from './state-changes.controller';
import { StateChangesService } from './state-changes.service';

describe('StateChangesController', () => {
  let controller: StateChangesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StateChangesController],
      providers: [StateChangesService],
    }).compile();

    controller = module.get<StateChangesController>(StateChangesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
