import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { isUUID } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import * as AWS from 'aws-sdk';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SubSupplierProductType } from '../sub-supplier-product-types/entities/sub-supplier-product-type.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SuppliersService {
  private readonly logger: Logger = new Logger('SuppliersService');

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(SubSupplierProductType)
    private readonly subSupplierProductTypeRepository: Repository<SubSupplierProductType>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject('EMAIL_CONFIG') private emailSenderConfig,
  ) { }

  async create(createSupplierDto: CreateSupplierDto, file: Express.Multer.File) {
    createSupplierDto.profitMargin = +createSupplierDto.profitMargin;
    createSupplierDto.hasApi = +createSupplierDto.hasApi;
    createSupplierDto.paymentDeadline = +createSupplierDto.paymentDeadline;
    createSupplierDto.advancePercentage = +createSupplierDto.advancePercentage;
    createSupplierDto.scheduledDaysToUpdate = +createSupplierDto.scheduledDaysToUpdate;

    if (createSupplierDto.bills)
      createSupplierDto.bills = +createSupplierDto.bills;

    if (!createSupplierDto.bankAccountNumber)
      delete createSupplierDto.bankAccount;

    const newSupplier = plainToClass(Supplier, createSupplierDto);

    const user = await this.userRepository.findOne({
      where: {
        id: createSupplierDto.user,
      },
      relations: [
        'admin',
        'client',
        'supplier',
        'supplier.subSupplierProductType'
      ],
    })

    if (!user)
      throw new NotFoundException(`User with id ${createSupplierDto.user}`);

    if (user.client || user.admin || user.supplier)
      throw new BadRequestException(`This user is already linked with a client, admin or supplier`);

    newSupplier.user = user;

    if (createSupplierDto.subSupplierProductType) {
      const subSupplierProductType = await this.subSupplierProductTypeRepository.findOneBy({ id: createSupplierDto.subSupplierProductType });

      if (!subSupplierProductType)
        throw new NotFoundException(`Sub supplier product type with id ${createSupplierDto.subSupplierProductType} not found`);

      newSupplier.subSupplierProductType = subSupplierProductType;
    }

    if (file != undefined) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      await this.uploadToAws(file);

      newSupplier.portfolio = file.originalname;
    }

    await this.supplierRepository.save(newSupplier);

    return {
      newSupplier
    };
  }







  
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.supplierRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    let supplier: Supplier;

    if (isUUID(term)) {
      supplier = await this.supplierRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.supplierRepository.createQueryBuilder();

      supplier = await queryBuilder
        .where('LOWER(name) =: name')
        .getOne();
    }

    if (!supplier)
      throw new NotFoundException(`Supplier with ${term} not found`);

    return {
      supplier
    };
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, file: Express.Multer.File) {
    if (!updateSupplierDto.bankAccountNumber)
      updateSupplierDto.bankAccount = null;

    const supplier = await this.supplierRepository.findOneBy({ id });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    if (file != undefined) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      await this.uploadToAws(file);

      supplier.portfolio = file.originalname;
    }

    updateSupplierDto.profitMargin = +updateSupplierDto.profitMargin;
    updateSupplierDto.hasApi = +updateSupplierDto.hasApi;
    updateSupplierDto.paymentDeadline = +updateSupplierDto.paymentDeadline;
    updateSupplierDto.advancePercentage = +updateSupplierDto.advancePercentage;
    updateSupplierDto.scheduledDaysToUpdate = +updateSupplierDto.scheduledDaysToUpdate;
    updateSupplierDto.bills = +updateSupplierDto.bills;

    const updatedSupplier = plainToClass(Supplier, updateSupplierDto);

    if (updateSupplierDto.subSupplierProductType) {
      const subSupplierProductType = await this.subSupplierProductTypeRepository.findOneBy({ id: updateSupplierDto.subSupplierProductType });

      if (!subSupplierProductType)
        throw new NotFoundException(`Sub supplier product type with id ${updateSupplierDto.subSupplierProductType} not found`);

      updatedSupplier.subSupplierProductType = subSupplierProductType;
    }

    Object.assign(supplier, updatedSupplier);

    await this.supplierRepository.save(supplier);

    return {
      supplier,
    };
  }

  async desactivate(id: string) {
    const supplier = await this.supplierRepository.findOne({
      where: {
        id,
      },
      relations: [
        'user',
      ],
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${id} not found`);

    supplier.isActive = !supplier.isActive;

    if (supplier.isActive) {
      supplier.isActive = false;

      try {
        // const transporter = nodemailer.createTransport(this.emailSenderConfig.transport);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: this.emailSenderConfig.transport.from,
          to: supplier.user.email,
          subject: 'Usuario activado exitosamente',
          text: 'Señor usuario, su cuenta ha sido desactivada, comuníquese con un administrador.',
        });
      } catch (error) {
        console.log('Failed to send the password recovery email', error);
        throw new InternalServerErrorException(`Internal server error`);
      }
    } else {
      supplier.isActive = true;

      try {
        // const transporter = nodemailer.createTransport(this.emailSenderConfig.transport);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: this.emailSenderConfig.transport.from,
          to: supplier.user.email,
          subject: 'Usuario activado exitosamente',
          text: 'Señor usuario, su cuenta ha sido activada satisfactoriamente, ahora se le permitirá el ingreso a la aplicación.',
        });
      } catch (error) {
        console.log('Failed to send the password recovery email', error);
        throw new InternalServerErrorException(`Internal server error`);
      }
    }

    await this.supplierRepository.save(supplier);

    return {
      supplier
    };
  }

  async remove(id: string) {
    const supplier = await this.supplierRepository.findOne({
      where: {
        id
      },
      relations: [
        'subSupplierProductType',
      ]
    });

    if (!supplier)
      throw new NotFoundException(`Supplier with id ${id} not found`);

    if (supplier.subSupplierProductType)
      throw new BadRequestException(`The supplier have relations with sub supplier product type and can't be deleted`);

    await this.supplierRepository.remove(supplier);

    return {
      supplier
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

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
