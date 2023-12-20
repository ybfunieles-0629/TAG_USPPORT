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

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) { }

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    const newPurchaseOrder: PurchaseOrder = plainToClass(PurchaseOrder, createPurchaseOrderDto);

    if (createPurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: createPurchaseOrderDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${createPurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${createPurchaseOrderDto.state} is currently inactive`);

      newPurchaseOrder.state = state;
    }

    await this.purchaseOrderRepository.save(newPurchaseOrder);

    return {
      newPurchaseOrder
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.purchaseOrderRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: PurchaseOrder[] = await this.purchaseOrderRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'orderListDetails',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id,
      },
    });

    if (!purchaseOrder)
      throw new NotFoundException(`Purchase order with id ${id} not found`);

    return {
      purchaseOrder
    };
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto, file: Express.Multer.File) {
    const purchaseOrder: PurchaseOrder = await this.purchaseOrderRepository.findOne({
      where: {
        id,
      },
    });

    if (!purchaseOrder)
      throw new NotFoundException(`Purchase order with id ${id} not found`);

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
    }

    let billingFileAwsUrl: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const imageUrl = await this.uploadToAws(file);

      billingFileAwsUrl = imageUrl;

      updatedPurchaseOrder.billingFile = file.originalname;
    }

    updatedPurchaseOrder.billingNumber = '0';
    updatePurchaseOrderDto.expirationDate = new Date();
    updatePurchaseOrderDto.value = 0;

    Object.assign(purchaseOrder, updatedPurchaseOrder);

    await this.purchaseOrderRepository.save(purchaseOrder);

    return {
      purchaseOrder
    };
  }

  async desactivate(id: string) {
    const { purchaseOrder } = await this.findOne(id);

    purchaseOrder.isActive = !purchaseOrder.isActive;

    await this.purchaseOrderRepository.save(purchaseOrder);

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

  async remove(id: string) {
    const { purchaseOrder } = await this.findOne(id);

    await this.purchaseOrderRepository.remove(purchaseOrder);

    return {
      purchaseOrder
    };
  }
}