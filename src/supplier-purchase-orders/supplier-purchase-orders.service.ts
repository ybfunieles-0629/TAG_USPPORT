import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

import { CreateSupplierPurchaseOrderDto } from './dto/create-supplier-purchase-order.dto';
import { UpdateSupplierPurchaseOrderDto } from './dto/update-supplier-purchase-order.dto';
import { SupplierPurchaseOrder } from './entities/supplier-purchase-order.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { State } from '../states/entities/state.entity';

@Injectable()
export class SupplierPurchaseOrdersService {
  constructor(
    @InjectRepository(SupplierPurchaseOrder)
    private readonly supplierPurchaseOrderRepository: Repository<SupplierPurchaseOrder>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) { }

  async create(createSupplierPurchaseOrderDto: CreateSupplierPurchaseOrderDto, file: Express.Multer.File) {
    const newSupplierPurchaseOrder: SupplierPurchaseOrder = plainToClass(SupplierPurchaseOrder, createSupplierPurchaseOrderDto);

    newSupplierPurchaseOrder.orderCode = uuidv4();

    if (createSupplierPurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: createSupplierPurchaseOrderDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${createSupplierPurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${createSupplierPurchaseOrderDto.state} is currently inactive`);

      newSupplierPurchaseOrder.state = state;
    }

    let tagPurchaseOrderDocument: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const pdfUrl = await this.uploadToAws(file);

      tagPurchaseOrderDocument = pdfUrl;

      newSupplierPurchaseOrder.tagPurchaseOrderDocument = file.originalname;
    }

    await this.supplierPurchaseOrderRepository.save(newSupplierPurchaseOrder);

    return {
      newSupplierPurchaseOrder
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const count: number = await this.supplierPurchaseOrderRepository.count();

    const { limit = count, offset = 0 } = paginationDto;

    const results: SupplierPurchaseOrder[] = await this.supplierPurchaseOrderRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'state',
        'stateChanges',
      ],
    });

    return {
      count,
      results
    };
  }

  async findOne(id: string) {
    const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.findOne({
      where: {
        id,
      },
      relations: [
        'state',
        'stateChanges',
      ],
    });

    if (!supplierPurchaseOrder)
      throw new NotFoundException(`Supplier purchase order with id ${id} not found`);

    return {
      supplierPurchaseOrder
    };
  }

  async update(id: string, updateSupplierPurchaseOrderDto: UpdateSupplierPurchaseOrderDto, file: Express.Multer.File) {
    const supplierPurchaseOrder: SupplierPurchaseOrder = await this.supplierPurchaseOrderRepository.findOne({
      where: {
        id,
      },
      relations: [
        'state',
        'stateChanges',
      ],
    });

    if (!supplierPurchaseOrder)
      throw new NotFoundException(`Supplier purchase order with id ${id} not found`);

    const updatedSupplierPurchaseOrder: SupplierPurchaseOrder = plainToClass(SupplierPurchaseOrder, updateSupplierPurchaseOrderDto);

    if (updateSupplierPurchaseOrderDto.state) {
      const state: State = await this.stateRepository.findOne({
        where: {
          id: updateSupplierPurchaseOrderDto.state,
        },
      });

      if (!state)
        throw new NotFoundException(`State with id ${updateSupplierPurchaseOrderDto.state} not found`);

      if (!state.isActive)
        throw new BadRequestException(`State with id ${updateSupplierPurchaseOrderDto.state} is currently inactive`);

      updatedSupplierPurchaseOrder.state = state;
    }

    let tagPurchaseOrderDocument: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const pdfUrl = await this.uploadToAws(file);

      tagPurchaseOrderDocument = pdfUrl;

      updatedSupplierPurchaseOrder.tagPurchaseOrderDocument = file.originalname;
    }

    Object.assign(supplierPurchaseOrder, updatedSupplierPurchaseOrder);

    await this.supplierPurchaseOrderRepository.save(supplierPurchaseOrder);

    return {
      supplierPurchaseOrder
    };
  }

  async desactivate(id: string) {
    const { supplierPurchaseOrder } = await this.findOne(id);

    supplierPurchaseOrder.isActive = !supplierPurchaseOrder.isActive;

    await this.supplierPurchaseOrderRepository.save(supplierPurchaseOrder);
  }

  async remove(id: string) {
    const { supplierPurchaseOrder } = await this.findOne(id);

    await this.supplierPurchaseOrderRepository.remove(supplierPurchaseOrder);

    return {
      supplierPurchaseOrder
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
