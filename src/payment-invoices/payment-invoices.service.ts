import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { CreatePaymentInvoiceDto } from './dto/create-payment-invoice.dto';
import { UpdatePaymentInvoiceDto } from './dto/update-payment-invoice.dto';
import { PaymentInvoice } from './entities/payment-invoice.entity';
import { User } from '../users/entities/user.entity';
import { SupplierPurchaseOrder } from '../supplier-purchase-orders/entities/supplier-purchase-order.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PaymentInvoicesService {
  constructor(
    @InjectRepository(PaymentInvoice)
    private readonly paymentInvoiceRepository: Repository<PaymentInvoice>,

    @InjectRepository(SupplierPurchaseOrder)
    private readonly supplierPurchaseOrderRepository: Repository<SupplierPurchaseOrder>,
  ) { }

  async create(createPaymentInvoiceDto: CreatePaymentInvoiceDto, user: User) {
    const newPaymentInvoice: PaymentInvoice = plainToClass(PaymentInvoice, createPaymentInvoiceDto);

    newPaymentInvoice.createdBy = user.id;

    if (createPaymentInvoiceDto.supplierPurchaseOrder) {
      const supplierPurchaseOrderId: string = createPaymentInvoiceDto.supplierPurchaseOrder;
      
      const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.findOne({
        where: {
          id: supplierPurchaseOrderId
        },
      });

      if (!supplierPurchaseOrder)
        throw new NotFoundException(`Supplier purchase order with id ${supplierPurchaseOrderId} not found`);

      if (!supplierPurchaseOrder.isActive)
        throw new BadRequestException(`Supplier purchase order with id ${supplierPurchaseOrderId} is currently inactive`);

      newPaymentInvoice.supplierPurchaseOrder = supplierPurchaseOrder;
    };

    await this.paymentInvoiceRepository.save(newPaymentInvoice);

    return {
      newPaymentInvoice
    };
  };

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.paymentInvoiceRepository.count();
    
    const { limit = count, offset = 0 } = paginationDto;

    const results: PaymentInvoice[] = await this.paymentInvoiceRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'supplierPurchaseOrder',
      ],
    });

    return {
      count,
      results
    };
  };

  findOne(id: number) {
    return `This action returns a #${id} paymentInvoice`;
  }

  update(id: number, updatePaymentInvoiceDto: UpdatePaymentInvoiceDto) {
    return `This action updates a #${id} paymentInvoice`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentInvoice`;
  }
}
