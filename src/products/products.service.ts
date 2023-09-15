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

  async apiMarpico() {
    const apiUrl = 'https://marpicoprod.azurewebsites.net/api/inventarios/materialesAPI';
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const headers = {
      Authorization: `Api-Key ${apiKey}`,
    };

    try {
      const { data } = await axios.get(apiUrl, { headers });
      
      return {
        data
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  private handleDbExceptions(error: any) {
    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}


// Yeison