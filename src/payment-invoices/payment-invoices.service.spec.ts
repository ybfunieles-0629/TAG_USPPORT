import { Test, TestingModule } from '@nestjs/testing';
import { PaymentInvoicesService } from './payment-invoices.service';

describe('PaymentInvoicesService', () => {
  let service: PaymentInvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentInvoicesService],
    }).compile();

    service = module.get<PaymentInvoicesService>(PaymentInvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
