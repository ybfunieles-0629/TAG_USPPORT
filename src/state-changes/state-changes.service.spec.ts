import { Test, TestingModule } from '@nestjs/testing';
import { StateChangesService } from './state-changes.service';

describe('StateChangesService', () => {
  let service: StateChangesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StateChangesService],
    }).compile();

    service = module.get<StateChangesService>(StateChangesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
