import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProductsService {
  async findAll() {
    const resp = await axios.get('https://api.cataprom.com/rest/productos/CP-175');

    return resp;
  }
}
