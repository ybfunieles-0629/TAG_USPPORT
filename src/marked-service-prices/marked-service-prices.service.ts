import { Injectable } from '@nestjs/common';
import { CreateMarkedServicePriceDto } from './dto/create-marked-service-price.dto';
import { UpdateMarkedServicePriceDto } from './dto/update-marked-service-price.dto';

@Injectable()
export class MarkedServicePricesService {
  create(createMarkedServicePriceDto: CreateMarkedServicePriceDto) {
    return 'This action adds a new markedServicePrice';
  }

  findAll() {
    return `This action returns all markedServicePrices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} markedServicePrice`;
  }

  update(id: number, updateMarkedServicePriceDto: UpdateMarkedServicePriceDto) {
    return `This action updates a #${id} markedServicePrice`;
  }

  remove(id: number) {
    return `This action removes a #${id} markedServicePrice`;
  }
}
