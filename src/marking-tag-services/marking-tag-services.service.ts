import { Injectable } from '@nestjs/common';
import { CreateMarkingTagServiceDto } from './dto/create-marking-tag-service.dto';
import { UpdateMarkingTagServiceDto } from './dto/update-marking-tag-service.dto';

@Injectable()
export class MarkingTagServicesService {
  create(createMarkingTagServiceDto: CreateMarkingTagServiceDto) {
    return 'This action adds a new markingTagService';
  }

  findAll() {
    return `This action returns all markingTagServices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} markingTagService`;
  }

  update(id: number, updateMarkingTagServiceDto: UpdateMarkingTagServiceDto) {
    return `This action updates a #${id} markingTagService`;
  }

  remove(id: number) {
    return `This action removes a #${id} markingTagService`;
  }
}
