import { Test, TestingModule } from '@nestjs/testing';
import { CategorySuppliersController } from './category-suppliers.controller';
import { CategorySuppliersService } from './category-suppliers.service';

describe('CategorySuppliersController', () => {
  let controller: CategorySuppliersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategorySuppliersController],
      providers: [CategorySuppliersService],
    }).compile();

    controller = module.get<CategorySuppliersController>(CategorySuppliersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
