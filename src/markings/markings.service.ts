import { Injectable } from '@nestjs/common';
import { CreateMarkingDto } from './dto/create-marking.dto';
import { UpdateMarkingDto } from './dto/update-marking.dto';

@Injectable()
export class MarkingsService {
  create(createMarkingDto: CreateMarkingDto) {
    return 'This action adds a new marking';
  }

  findAll() {
    return `This action returns all markings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marking`;
  }

  update(id: number, updateMarkingDto: UpdateMarkingDto) {
    return `This action updates a #${id} marking`;
  }

  remove(id: number) {
    return `This action removes a #${id} marking`;
  }
}
