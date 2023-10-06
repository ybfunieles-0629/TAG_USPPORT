import { Injectable } from '@nestjs/common';
import { CreateMarkingServicePropertyDto } from './dto/create-marking-service-property.dto';
import { UpdateMarkingServicePropertyDto } from './dto/update-marking-service-property.dto';

@Injectable()
export class MarkingServicePropertiesService {
  create(createMarkingServicePropertyDto: CreateMarkingServicePropertyDto) {
    return 'This action adds a new markingServiceProperty';
  }

  findAll() {
    return `This action returns all markingServiceProperties`;
  }

  findOne(id: number) {
    return `This action returns a #${id} markingServiceProperty`;
  }

  update(id: number, updateMarkingServicePropertyDto: UpdateMarkingServicePropertyDto) {
    return `This action updates a #${id} markingServiceProperty`;
  }

  remove(id: number) {
    return `This action removes a #${id} markingServiceProperty`;
  }
}
