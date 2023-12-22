import { Injectable, NotFoundException, BadRequestException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateOrderListDetailDto } from './dto/create-order-list-detail.dto';
import { UpdateOrderListDetailDto } from './dto/update-order-list-detail.dto';
import { OrderListDetail } from './entities/order-list-detail.entity';
import { OrderRating } from '../order-ratings/entities/order-rating.entity';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { MarkingService } from '../marking-services/entities/marking-service.entity';
import { TransportService } from '../transport-services/entities/transport-service.entity';
import { State } from '../states/entities/state.entity';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SupplierPurchaseOrder } from '../supplier-purchase-orders/entities/supplier-purchase-order.entity';

@Injectable()
export class OrderListDetailsService {
  constructor(
    @InjectRepository(OrderListDetail)
    private readonly orderListDetailRepository: Repository<OrderListDetail>,

    @InjectRepository(MarkingService)
    private readonly markingServiceRepository: Repository<MarkingService>,

    @InjectRepository(OrderRating)
    private readonly orderRatingRepository: Repository<OrderRating>,

    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,

    @InjectRepository(SupplierPurchaseOrder)
    private readonly supplierPurchaseOrderRepository: Repository<SupplierPurchaseOrder>,

    @InjectRepository(TransportService)
    private readonly transportServiceRepository: Repository<TransportService>,
  ) { }

  async create(createOrderListDetailDto: CreateOrderListDetailDto) {
    const newOrderListDetail: OrderListDetail = plainToClass(OrderListDetail, createOrderListDetailDto);

    if (createOrderListDetailDto.orderRating) {
      const orderRating: OrderRating = await this.orderRatingRepository.findOne({
        where: {
          id: createOrderListDetailDto.orderRating,
        },
      });

      if (!orderRating)
        throw new NotFoundException(`Order rating with id ${createOrderListDetailDto.orderRating} not found`);

      if (!orderRating.isActive)
        throw new BadRequestException(`Order rating with id ${createOrderListDetailDto.orderRating} is currently inactive`);

      newOrderListDetail.orderRating = orderRating;
    };

    if (createOrderListDetailDto.purchaseOrder) {
      const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
        where: {
          id: createOrderListDetailDto.purchaseOrder,
        },
      });

      if (!purchaseOrder)
        throw new NotFoundException(`Purchase order with id ${createOrderListDetailDto.purchaseOrder} not found`);

      if (!purchaseOrder.isActive)
        throw new BadRequestException(`Purchase order with id ${createOrderListDetailDto.purchaseOrder} is currently inactive`);

      newOrderListDetail.purchaseOrder = purchaseOrder;
    };

    if (createOrderListDetailDto.markingService) {
      const markingService: MarkingService = await this.markingServiceRepository.findOne({
        where: {
          id: createOrderListDetailDto.markingService,
        },
      });

      if (!markingService)
        throw new NotFoundException(`Marking service with id ${createOrderListDetailDto.markingService} not found`);

      if (!markingService.isActive)
        throw new BadRequestException(`Marking service with id ${createOrderListDetailDto.markingService} is currently inactive`);

      newOrderListDetail.markingService = markingService;
    };

    if (createOrderListDetailDto.transportService) {
      const transportService: TransportService = await this.transportServiceRepository.findOne({
        where: {
          id: createOrderListDetailDto.transportService,
        },
      });

      if (!transportService)
        throw new NotFoundException(`Transport service with id ${createOrderListDetailDto.transportService} not found`);

      if (!transportService.isActive)
        throw new BadRequestException(`Transport service with id ${createOrderListDetailDto.transportService} is currently inactive`);

      newOrderListDetail.transportService = transportService;
    };

    if (createOrderListDetailDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: createOrderListDetailDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${createOrderListDetailDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${createOrderListDetailDto.state} is currently inactive`);

      newOrderListDetail.state = state;
    };

    if (createOrderListDetailDto.product) {
      const product: Product = await this.productRepository.findOne({
        where: {
          id: createOrderListDetailDto.product,
        },
      });

      if (!product)
        throw new NotFoundException(`Product with id ${createOrderListDetailDto.product} not found`);

      if (!product.isActive)
        throw new BadRequestException(`Product with id ${createOrderListDetailDto.product} is currently inactive`);

      newOrderListDetail.product = product;
    };

    await this.orderListDetailRepository.save(newOrderListDetail);

    return {
      newOrderListDetail
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.orderListDetailRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: OrderListDetail[] = await this.orderListDetailRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'markingService',
        'orderRating',
        'purchaseOrder',
        'product',
        'state',
        'transportService',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const orderListDetail: OrderListDetail = await this.orderListDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingService',
        'orderRating',
        'purchaseOrder',
        'product',
        'state',
        'transportService',
      ],
    });

    if (!orderListDetail)
      throw new NotFoundException(`Order list detail with id ${id} not found`);

    return {
      orderListDetail
    };
  }

  async update(id: string, updateOrderListDetailDto: UpdateOrderListDetailDto) {
    const orderListDetail: OrderListDetail = await this.orderListDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingService',
        'orderRating',
        'purchaseOrder',
        'product',
        'state',
        'transportService',
      ],
    });

    if (!orderListDetail)
      throw new NotFoundException(`Order list detail with id ${id} not found`);

    const updatedOrderListDetail: OrderListDetail = plainToClass(OrderListDetail, updateOrderListDetailDto);

    if (updateOrderListDetailDto.orderRating) {
      const orderRating: OrderRating = await this.orderRatingRepository.findOne({
        where: {
          id: updateOrderListDetailDto.orderRating,
        },
      });

      if (!orderRating)
        throw new NotFoundException(`Order rating with id ${updateOrderListDetailDto.orderRating} not found`);

      if (!orderRating.isActive)
        throw new BadRequestException(`Order rating with id ${updateOrderListDetailDto.orderRating} is currently inactive`);

      updatedOrderListDetail.orderRating = orderRating;
    };

    if (updateOrderListDetailDto.purchaseOrder) {
      const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
        where: {
          id: updateOrderListDetailDto.purchaseOrder,
        },
      });

      if (!purchaseOrder)
        throw new NotFoundException(`Purchase order with id ${updateOrderListDetailDto.purchaseOrder} not found`);

      if (!purchaseOrder.isActive)
        throw new BadRequestException(`Purchase order with id ${updateOrderListDetailDto.purchaseOrder} is currently inactive`);

      updatedOrderListDetail.purchaseOrder = purchaseOrder;
    };

    if (updateOrderListDetailDto.markingService) {
      const markingService: MarkingService = await this.markingServiceRepository.findOne({
        where: {
          id: updateOrderListDetailDto.markingService,
        },
      });

      if (!markingService)
        throw new NotFoundException(`Marking service with id ${updateOrderListDetailDto.markingService} not found`);

      if (!markingService.isActive)
        throw new BadRequestException(`Marking service with id ${updateOrderListDetailDto.markingService} is currently inactive`);

      updatedOrderListDetail.markingService = markingService;
    };

    if (updateOrderListDetailDto.transportService) {
      const transportService: TransportService = await this.transportServiceRepository.findOne({
        where: {
          id: updateOrderListDetailDto.transportService,
        },
      });

      if (!transportService)
        throw new NotFoundException(`Transport service with id ${updateOrderListDetailDto.transportService} not found`);

      if (!transportService.isActive)
        throw new BadRequestException(`Transport service with id ${updateOrderListDetailDto.transportService} is currently inactive`);

      updatedOrderListDetail.transportService = transportService;
    };

    if (updateOrderListDetailDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: updateOrderListDetailDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${updateOrderListDetailDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${updateOrderListDetailDto.state} is currently inactive`);

      updatedOrderListDetail.state = state;
    };

    if (updateOrderListDetailDto.product) {
      const product: Product = await this.productRepository.findOne({
        where: {
          id: updateOrderListDetailDto.product,
        },
      });

      if (!product)
        throw new NotFoundException(`Product with id ${updateOrderListDetailDto.product} not found`);

      if (!product.isActive)
        throw new BadRequestException(`Product with id ${updateOrderListDetailDto.product} is currently inactive`);

      updatedOrderListDetail.product = product;
    };

    if (updateOrderListDetailDto.supplierPurchaseOrder) {
      const supplierPurchaseOrderId: string = updateOrderListDetailDto.supplierPurchaseOrder;
      
      const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.findOne({
        where: {
          id: supplierPurchaseOrderId,
        },
      });

      if (!supplierPurchaseOrder)
        throw new NotFoundException(`Supplier purchase order with id ${supplierPurchaseOrderId} not found`);

      if (!supplierPurchaseOrder.isActive)
        throw new BadRequestException(`Supplier purchase order with id ${supplierPurchaseOrderId} is currently inactive`);

      updatedOrderListDetail.supplierPurchaseOrder = supplierPurchaseOrder;
    };

    Object.assign(orderListDetail, updatedOrderListDetail);

    await this.orderListDetailRepository.save(orderListDetail);

    return {
      orderListDetail
    };
  }

  async desactivate(id: string) {
    const { orderListDetail } = await this.findOne(id);

    orderListDetail.isActive = !orderListDetail.isActive;

    await this.orderListDetailRepository.save(orderListDetail);

    return {
      orderListDetail
    };
  }

  async remove(id: string) {
    const { orderListDetail } = await this.findOne(id);

    await this.orderListDetailRepository.remove(orderListDetail);

    return {
      orderListDetail
    };
  }
}
