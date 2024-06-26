import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { State } from '../states/entities/state.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { Client } from '../clients/entities/client.entity';
import { ShippingGuide } from '../shipping-guides/entities/shipping-guide.entity';
import { Brand } from 'src/brands/entities/brand.entity';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,


  
    @InjectRepository(ShippingGuide)
    private readonly shippingGuideRepository: Repository<ShippingGuide>,
  ) { }

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto, user: User) {
    const newPurchaseOrder: PurchaseOrder = plainToClass(PurchaseOrder, createPurchaseOrderDto);

    newPurchaseOrder.createdBy = user.id;

    if (createPurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: createPurchaseOrderDto.state,
        },
      }); 

      if (createPurchaseOrderDto.approvalDate || createPurchaseOrderDto.creationDate || createPurchaseOrderDto.paymentDate) {
        createPurchaseOrderDto.approvalDate = new Date(createPurchaseOrderDto.approvalDate);
        createPurchaseOrderDto.creationDate = new Date(createPurchaseOrderDto.creationDate);
        createPurchaseOrderDto.paymentDate = new Date(createPurchaseOrderDto.paymentDate);
      };

      if (!state)
        throw new NotFoundException(`State with id ${createPurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${createPurchaseOrderDto.state} is currently inactive`);

      newPurchaseOrder.state = state;
    };

    if (createPurchaseOrderDto.clientUser) {
      const userId: string = createPurchaseOrderDto.clientUser;

      const clientUser: User = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!clientUser)
        throw new NotFoundException(`User with id ${userId} not found`);

      if (!clientUser.isActive)
        throw new BadRequestException(`The user with id ${userId} is currently inactive`);

      newPurchaseOrder.clientUser = clientUser.id;
    };

    if (createPurchaseOrderDto.commercialUser) {
      const userId: string = createPurchaseOrderDto.commercialUser;

      const commercialUser: User = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!commercialUser)
        throw new NotFoundException(`User with id ${userId} not found`);

      if (!commercialUser.isActive)
        throw new BadRequestException(`The user with id ${userId} is currently inactive`);

      newPurchaseOrder.commercialUser = commercialUser.id;
    };

    await this.purchaseOrderRepository.save(newPurchaseOrder);

    return {
      newPurchaseOrder
    };
  }









  async findAll(paginationDto: PaginationDto, user: User) {
    let count: number = await this.purchaseOrderRepository.count();
    let count2: number = await this.purchaseOrderRepository.count();
    console.log(count)
    const { limit = count, offset = 0 } = paginationDto;
    let results: PurchaseOrder[] = [];
    console.log(user.roles)

    if (user.roles.some((role) => role.name.toLowerCase().trim() == 'comercial')) {
      const clientIds: string[] = user.admin.clients.map(client => client.id);
      for (const clientId of clientIds) {
        const result = await this.purchaseOrderRepository
          .createQueryBuilder('purchase')
          .leftJoinAndSelect('purchase.orderListDetails', 'orderListDetails')
          .leftJoinAndSelect('orderListDetails.cartQuote', 'cartQuote')
          .leftJoinAndSelect('cartQuote.client', 'cartQuoteClient')
          .leftJoinAndSelect('cartQuoteClient.user', 'cartQuoteClientUser')
          .leftJoinAndSelect('cartQuoteClientUser.brands', 'cartQuoteClientUserBrands')
          .leftJoinAndSelect('orderListDetails.state', 'orderListDetailsState')
          .leftJoinAndSelect('orderListDetails.orderRating', 'orderListDetailsOrderRating')
          .leftJoinAndSelect('orderListDetails.supplierPurchaseOrder', 'supplierPurchaseOrder')
          .leftJoinAndSelect('supplierPurchaseOrder.state', 'supplierPurchaseOrderState')
          .leftJoinAndSelect('orderListDetails.product', 'product')
          .leftJoinAndSelect('product.refProduct', 'refProduct')
          .leftJoinAndSelect('refProduct.supplier', 'refProductSupplier')
          .leftJoinAndSelect('refProductSupplier.user', 'refProductSupplierUser')
          .leftJoinAndSelect('purchase.state', 'purchaseState')
          .leftJoinAndSelect('purchase.commercialQualification', 'commercialQualification')
          .where('purchase.clientUser =:clientId', { clientId })
          .skip(offset)
          .take(limit)
          .getMany();

        results.push(...result);

        count += results.length;
      } 
    } else if (user.roles.some((role) => role.name.toLowerCase().trim() == 'cliente')) {
      results = await this.purchaseOrderRepository
        .createQueryBuilder('purchase')
        .where('purchase.clientUser =:clientId', { clientId: user.client.id })
        .leftJoinAndSelect('purchase.orderListDetails', 'orderListDetails')
        .leftJoinAndSelect('orderListDetails.cartQuote', 'cartQuote')
        .leftJoinAndSelect('orderListDetails.state', 'orderListDetailsState')
        .leftJoinAndSelect('orderListDetails.orderRating', 'orderListDetailsOrderRating')
        .leftJoinAndSelect('orderListDetails.supplierPurchaseOrder', 'supplierPurchaseOrder')
        .leftJoinAndSelect('supplierPurchaseOrder.state', 'supplierPurchaseOrderState')
        .leftJoinAndSelect('orderListDetails.product', 'product')
        .leftJoinAndSelect('product.refProduct', 'refProduct')
        .leftJoinAndSelect('refProduct.supplier', 'refProductSupplier')
        .leftJoinAndSelect('refProductSupplier.user', 'refProductSupplierUser')
        .leftJoinAndSelect('purchase.state', 'purchaseState')
        .leftJoinAndSelect('purchase.commercialQualification', 'commercialQualification')
        .leftJoinAndSelect('cartQuote.quoteDetails', 'quoteDetails') // Añadido para acceder a QuoteDetail
        .leftJoinAndSelect('quoteDetails.markingServices', 'markingServices') // Añadido para acceder a MarkingService

        .skip(offset)
        .take(limit)
        .getMany();

      count = results.length;
    } else {
      results = await this.purchaseOrderRepository
        .createQueryBuilder('purchase')
        .leftJoinAndSelect('purchase.orderListDetails', 'orderListDetails')
        .leftJoinAndSelect('orderListDetails.cartQuote', 'cartQuote')
        .leftJoinAndSelect('orderListDetails.state', 'orderListDetailsState')
        .leftJoinAndSelect('orderListDetails.orderRating', 'orderListDetailsOrderRating')
        .leftJoinAndSelect('orderListDetails.supplierPurchaseOrder', 'supplierPurchaseOrder')
        .leftJoinAndSelect('supplierPurchaseOrder.state', 'supplierPurchaseOrderState')
        .leftJoinAndSelect('orderListDetails.product', 'product')
        .leftJoinAndSelect('product.refProduct', 'refProduct')
        .leftJoinAndSelect('refProduct.supplier', 'refProductSupplier')
        .leftJoinAndSelect('refProductSupplier.user', 'refProductSupplierUser')
        .leftJoinAndSelect('purchase.state', 'purchaseState')
        .leftJoinAndSelect('purchase.commercialQualification', 'commercialQualification')
        .leftJoinAndSelect('cartQuote.quoteDetails', 'quoteDetails') // Añadido para acceder a QuoteDetail
        .leftJoinAndSelect('quoteDetails.markingServices', 'markingServices') // Añadido para acceder a MarkingService

        .skip(offset)
        .take(limit)
        .getMany();

      console.log(count)
    };   


    const finalResults = await Promise.all(
      results.map(async (purchaseOrder: PurchaseOrder) => {
        const commercialUser: User = await this.userRepository.findOne({
          where: {
            id: purchaseOrder.commercialUser,
          },
        });

        const clientUser: Client = await this.clientRepository.findOne({
          where: {
            id: purchaseOrder.clientUser,
          },
          relations: [
            'user',
          ],
        });


        const brandClient: Brand = await this.brandRepository.findOne({
          where: {
            id: purchaseOrder.nameBrandClient,
          },
        });


        return {
          ...purchaseOrder,
          commercialUser,
          clientUser,
          brandClient,
        };
      })
    );

    return {
      count,
      finalResults
    };
  }

  async findOne(id: string) {
    const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id,
      },
      relations: [
        'orderListDetails',
        'orderListDetails.cartQuote',
        'orderListDetails.orderRating',
        'orderListDetails.state',
        'orderListDetails.supplierPurchaseOrder',
        'orderListDetails.supplierPurchaseOrder.state',
        'orderListDetails.product',
        'orderListDetails.product.refProduct',
        'orderListDetails.product.refProduct.supplier',
        'orderListDetails.product.refProduct.supplier.user',
        'state',
        'commercialQualification',
      ],
    });

    if (!purchaseOrder)
      throw new NotFoundException(`Purchase order with id ${id} not found`);

    const commercialUser: User = await this.userRepository.findOne({
      where: {
        id: purchaseOrder.commercialUser,
      },
    });

    const clientUser: Client = await this.clientRepository.findOne({
      where: {
        id: purchaseOrder.clientUser,
      },
      relations: [
        'user',
      ],
    });

    const finalResult = {
      ...purchaseOrder,
      commercialUser,
      clientUser
    }

    return {
      finalResult
    };
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto, files: Record<string, Express.Multer.File>, user: User) {
    const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id,
      },
    });

    if (!purchaseOrder)
      throw new NotFoundException(`Purchase order with id ${id} not found`);

    if (updatePurchaseOrderDto.approvalDate || updatePurchaseOrderDto.creationDate || updatePurchaseOrderDto.paymentDate) {
      updatePurchaseOrderDto.approvalDate = new Date(updatePurchaseOrderDto.approvalDate);
      updatePurchaseOrderDto.creationDate = new Date(updatePurchaseOrderDto.creationDate);
      updatePurchaseOrderDto.paymentDate = new Date(updatePurchaseOrderDto.paymentDate);
    };

    const updatedPurchaseOrder: PurchaseOrder = plainToClass(PurchaseOrder, updatePurchaseOrderDto);

    if (updatePurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: updatePurchaseOrderDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${updatePurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${updatePurchaseOrderDto.state} is currently inactive`);

      updatedPurchaseOrder.state = state;

      // if (state.name.toLowerCase() == 'aprobada') {
      //   updatedPurchaseOrder.commercialUser = user.id;
      // };
    }

    let billingFileAwsUrl: string = '';

    if (files != undefined) {
      for (const [fieldName, fileInfo] of Object.entries(files)) {
        const uniqueFilename = `${uuidv4()}-${fileInfo[0].originalname}`;
        fileInfo[0].originalname = uniqueFilename;

        await this.uploadToAws(fileInfo[0]);

        if (fileInfo[0].fieldname === 'orderDocument') {
          updatedPurchaseOrder.orderDocument = uniqueFilename;
        } else if (fileInfo[0].fieldname === 'billingFile') {
          updatedPurchaseOrder.billingFile = uniqueFilename;
        }
      }
    };

    if (updatePurchaseOrderDto.shippingGuide) {
      const shipingGuideId: string = updatePurchaseOrderDto.shippingGuide;

      const shippingGuide: ShippingGuide = await this.shippingGuideRepository.findOne({
        where: {
          id: shipingGuideId,
        },
      });

      if (!shippingGuide)
        throw new NotFoundException(`Shipping guite with id ${shipingGuideId} not found`);

      if (!shippingGuide.isActive)
        throw new BadRequestException(`Shipping guide with id ${shipingGuideId} is currently inactive`);

      updatedPurchaseOrder.shippingGuide = shippingGuide;
    };

    Object.assign(purchaseOrder, updatedPurchaseOrder);

    await this.purchaseOrderRepository.save(purchaseOrder);

    return {
      purchaseOrder
    };
  }

  async desactivate(id: string) {
    const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id,
      }
    });

    purchaseOrder.isActive = !purchaseOrder.isActive;

    await this.purchaseOrderRepository.save(purchaseOrder);

    return {
      purchaseOrder
    };
  }

  async remove(id: string) {
    const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id,
      }
    });

    await this.purchaseOrderRepository.remove(purchaseOrder);

    return {
      purchaseOrder
    };
  }

  private async uploadToAws(file: Express.Multer.File) {
    AWS.config.update({
      accessKeyId: 'AKIARACQVPFRECVYXGCC',
      secretAccessKey: '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',
      region: 'us-east-1',
    });

    const s3 = new AWS.S3();

    const params = {
      Bucket: 'tag-storage-documents',
      Key: file.originalname,
      Body: file.buffer,
    }

    return new Promise<string>((resolve, reject) => {
      s3.upload(params, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Location);
        }
      })
    })
  }
}