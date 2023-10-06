import { Injectable } from '@nestjs/common';
import { CreateCategorySupplierDto } from './dto/create-category-supplier.dto';
import { UpdateCategorySupplierDto } from './dto/update-category-supplier.dto';

@Injectable()
export class CategorySuppliersService {
  create(createCategorySupplierDto: CreateCategorySupplierDto) {
    return 'This action adds a new categorySupplier';
  }

  findAll() {
    return `This action returns all categorySuppliers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categorySupplier`;
  }

  update(id: number, updateCategorySupplierDto: UpdateCategorySupplierDto) {
    return `This action updates a #${id} categorySupplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} categorySupplier`;
  }
}
