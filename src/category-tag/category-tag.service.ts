import { Injectable } from '@nestjs/common';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';

@Injectable()
export class CategoryTagService {
  create(createCategoryTagDto: CreateCategoryTagDto) {
    return 'This action adds a new categoryTag';
  }

  findAll() {
    return `This action returns all categoryTag`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryTag`;
  }

  update(id: number, updateCategoryTagDto: UpdateCategoryTagDto) {
    return `This action updates a #${id} categoryTag`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryTag`;
  }
}
