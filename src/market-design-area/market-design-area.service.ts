import { Injectable } from '@nestjs/common';
import { CreateMarketDesignAreaDto } from './dto/create-market-design-area.dto';
import { UpdateMarketDesignAreaDto } from './dto/update-market-design-area.dto';

@Injectable()
export class MarketDesignAreaService {
  create(createMarketDesignAreaDto: CreateMarketDesignAreaDto) {
    return 'This action adds a new marketDesignArea';
  }

  findAll() {
    return `This action returns all marketDesignArea`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marketDesignArea`;
  }

  update(id: number, updateMarketDesignAreaDto: UpdateMarketDesignAreaDto) {
    return `This action updates a #${id} marketDesignArea`;
  }

  remove(id: number) {
    return `This action removes a #${id} marketDesignArea`;
  }
}
