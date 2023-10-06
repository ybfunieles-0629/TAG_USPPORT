import { Injectable } from '@nestjs/common';
import { CreateVariantReferenceDto } from './dto/create-variant-reference.dto';
import { UpdateVariantReferenceDto } from './dto/update-variant-reference.dto';

@Injectable()
export class VariantReferenceService {
  create(createVariantReferenceDto: CreateVariantReferenceDto) {
    return 'This action adds a new variantReference';
  }

  findAll() {
    return `This action returns all variantReference`;
  }

  findOne(id: number) {
    return `This action returns a #${id} variantReference`;
  }

  update(id: number, updateVariantReferenceDto: UpdateVariantReferenceDto) {
    return `This action updates a #${id} variantReference`;
  }

  remove(id: number) {
    return `This action removes a #${id} variantReference`;
  }
}
