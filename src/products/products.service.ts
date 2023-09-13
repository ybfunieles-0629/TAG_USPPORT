import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProductsService {
  private readonly logger: Logger = new Logger('ProductsService');
  
  async findAll() {
    try {
      const resp = await axios.get('https://api.cataprom.com/rest/productos/CP-175');
      return resp;
    } catch (error) {
      this.handleDbExceptions(error);
    }

  }

  private handleDbExceptions(error: any) {
    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
