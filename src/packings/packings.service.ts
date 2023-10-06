import { Injectable } from '@nestjs/common';
import { CreatePackingDto } from './dto/create-packing.dto';
import { UpdatePackingDto } from './dto/update-packing.dto';

@Injectable()
export class PackingsService {
  create(createPackingDto: CreatePackingDto) {
    return 'This action adds a new packing';
  }

  findAll() {
    return `This action returns all packings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} packing`;
  }

  update(id: number, updatePackingDto: UpdatePackingDto) {
    return `This action updates a #${id} packing`;
  }

  remove(id: number) {
    return `This action removes a #${id} packing`;
  }
}
