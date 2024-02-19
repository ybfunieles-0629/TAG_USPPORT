import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { plainToClass } from 'class-transformer';
import * as AWS from 'aws-sdk';

import { CreateShippingGuideDto } from './dto/create-shipping-guide.dto';
import { UpdateShippingGuideDto } from './dto/update-shipping-guide.dto';
import { ShippingGuide } from './entities/shipping-guide.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ShippingGuidesService {
  constructor(
    @InjectRepository(ShippingGuide)
    private readonly shippingGuideRepository: Repository<ShippingGuide>,
  ) { }

  async create(createShippingGuideDto: CreateShippingGuideDto, file: Express.Multer.File, user: User) {
    const newShippingGuide: ShippingGuide = plainToClass(ShippingGuide, createShippingGuideDto);

    newShippingGuide.createdBy = user.id;

    let deliveryProofFile: string = '';

    if (file !== null) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;

      file.originalname = uniqueFilename;

      const pdfUrl = await this.uploadToAws(file);

      deliveryProofFile = pdfUrl;

      newShippingGuide.deliveryProof = file.originalname;
    };

    await this.shippingGuideRepository.save(newShippingGuide);

    return {
      newShippingGuide
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
