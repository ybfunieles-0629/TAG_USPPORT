import { Test, TestingModule } from '@nestjs/testing';
import { PaymentInvoicesController } from './payment-invoices.controller';
import { PaymentInvoicesService } from './payment-invoices.service';

describe('PaymentInvoicesController', () => {
  let controller: PaymentInvoicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentInvoicesController],
      providers: [PaymentInvoicesService],
    }).compile();

    controller = module.get<PaymentInvoicesController>(PaymentInvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
