import { Injectable } from '@nestjs/common';
import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';

@Injectable()
export class RefProductsService {
  create(createRefProductDto: CreateRefProductDto) {
    return 'This action adds a new refProduct';
  }

  findAll() {
    return `This action returns all refProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} refProduct`;
  }

  update(id: number, updateRefProductDto: UpdateRefProductDto) {
    return `This action updates a #${id} refProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} refProduct`;
  }
}
