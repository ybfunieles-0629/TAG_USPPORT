import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import axios from 'axios';

import { CreatePackingDto } from './dto/create-packing.dto';
import { UpdatePackingDto } from './dto/update-packing.dto';
import { Packing } from './entities/packing.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { plainToClass } from 'class-transformer';
import { Product } from '../products/entities/product.entity';
import { RefProduct } from '../ref-products/entities/ref-product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PackingsService {
  private readonly logger: Logger = new Logger('PackingsService');

  constructor(
    @InjectRepository(Packing)
    private readonly packingRepository: Repository<Packing>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(RefProduct)
    private readonly refProductRepository: Repository<RefProduct>,
  ) { }

  async create(createPackingDto: CreatePackingDto, user: User) {
    const newPacking = plainToClass(Packing, createPackingDto);

    newPacking.createdBy = user.id;

    if (isUUID(createPackingDto.product)) {
      const product = await this.productRepository.findOne({
        where: {
          id: createPackingDto.product,
        },
      });

      if (!product)
        throw new NotFoundException(`Product with id ${createPackingDto.product} not found`);

      if (!product.isActive)
        throw new BadRequestException(`Product with id ${createPackingDto.product} is currently inactive`);

      console.log('is uuid');

      newPacking.product = product;
    } else {
      newPacking.product = null;
    }

    if (isUUID(createPackingDto.refProduct)) {
      const refProduct = await this.refProductRepository.findOne({
        where: {
          id: createPackingDto.refProduct,
        },
      });

      if (!refProduct)
        throw new NotFoundException(`Ref product with id ${createPackingDto.refProduct} not found`);

      if (!refProduct.isActive)
        throw new BadRequestException(`Ref product with id ${createPackingDto.refProduct} is currently inactive`);

      newPacking.refProduct = refProduct;
    } else {
      newPacking.refProduct = null;
    }

    await this.packingRepository.save(newPacking);

    return {
      newPacking
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.packingRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'product',
        'refProduct',
      ],
    });
  }

  async findOne(id: string) {
    const packing = await this.packingRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
        'refProduct',
      ],
    });

    if (!packing)
      throw new NotFoundException(`Packing with id ${id} not found`);

    return {
      packing
    };
  }

  async update(id: string, updatePackingDto: UpdatePackingDto, user: User) {
    const packing = await this.packingRepository.findOne({
      where: {
        id,
      },
      relations: [
        'product',
        'refProduct',
      ],
    });

    const updatedPacking = plainToClass(Packing, updatePackingDto);

    updatedPacking.updatedBy = user.id;

    if (updatePackingDto.product) {
      const product = await this.productRepository.findOne({
        where: {
          id: updatePackingDto.product,
        },
      });

      if (!product)
        throw new NotFoundException(`Product with id ${updatePackingDto.product} not found`);

      if (!product.isActive)
        throw new BadRequestException(`Product with id ${updatePackingDto.product} is currently inactive`);


      updatedPacking.product = product;
    }

    const refProduct = await this.refProductRepository.findOne({
      where: {
        id: updatePackingDto.refProduct,
      },
    });

    if (!refProduct)
      throw new NotFoundException(`Ref product with id ${updatePackingDto.refProduct} not found`);

    if (!refProduct.isActive)
      throw new BadRequestException(`Ref product with id ${updatePackingDto.refProduct} is currently inactive`);

    updatedPacking.refProduct = refProduct;

    Object.assign(packing, updatedPacking);

    await this.packingRepository.save(packing);

    return {
      packing
    };
  }

  async desactivate(id: string) {
    const { packing } = await this.findOne(id);

    packing.isActive = !packing.isActive;

    await this.packingRepository.save(packing);

    return {
      packing
    };
  }

  async remove(id: string) {
    const { packing } = await this.findOne(id);

    await this.packingRepository.remove(packing);

    return {
      packing
    };
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY')
      throw new BadRequestException(error.sqlMessage);

    this.logger.error(error);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }















  //* ---------- LOAD ALL PRODUCTS FROM EXT APIS ---------- *//
  async loadPakingSupplier(supplier: string) {
    const supplierName: string = supplier || '';
    console.log(supplierName)

    if (supplierName.toLowerCase().trim() == 'marpico') {
      await this.loadMarpicoRefProducts();
    } else if (supplierName.toLowerCase().trim() == 'promoopciones') {
      await this.loadPackingPromoOpcion();
    } else if (supplierName.toLowerCase().trim() == 'cdo') {
      await this.loadPackingPromoOpcion();
    }
  }


  // EMPAQUE DE PROMO OPCION
  async loadPackingPromoOpcion() {
    // URL API
    const apiUrl = 'https://promocionalesenlinea.net/api/all-products';

    console.log(apiUrl);
    const bodyData = {
      user: 'COL0238',
      password: 'h1xSgEICLQB2nqE19y2k',
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(apiUrl, bodyData, config);

      const { success, response: responseData } = response.data;
      if (success) {
        for (const item of responseData) {
          // Buscar referencia de producto por skuPadre
          const refProduct = await this.refProductRepository.findOne({
            where: { referenceCode: item.skuPadre },
            relations: ['packings'],
          });

          if (refProduct) {
            // Verificar si ya existe un packing asociado a la referencia
            let packing = refProduct.packings && refProduct.packings.length > 0 ? refProduct.packings[0] : null;

            // Si no existe un packing, crear uno nuevo
            if (!packing) {
              packing = new Packing();
              packing.refProduct = refProduct;
            }

            // Actualizar los datos del packing
            packing.unities = parseInt(item.paquete.PiezasCaja);
            packing.large = parseFloat(item.paquete.largo);
            packing.width = parseFloat(item.paquete.ancho);
            packing.height = parseFloat(item.paquete.alto);
            packing.smallPackingWeight = parseFloat(item.paquete.pesoNeto);

            // Guardar o actualizar el packing asociado a la referencia
            await this.packingRepository.save(packing);
          } else {
            console.log(`Referencia de producto con skuPadre ${item.skuPadre} no encontrada.`);
          }
        }
      } else {
        console.log('API response was not successful.');
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }
  }



  // EMPAQUE DE MARPICOS
  private async loadMarpicoRefProducts() {

     // URL API
    const apiUrl = 'https://apipromocionales.marpico.co/api/inventarios/materialesAPI';
    const apiKey = 'KZuMI3Fh5yfPSd7bJwqoIicdw2SNtDkhSZKmceR0PsKZzCm1gK81uiW59kL9n76z';

    const config = {
      headers: {
        Authorization: `Api-Key ${apiKey}`,
      },
    };


    try {
      const { data: { results } } = await axios.get(apiUrl, config);

      if (results) {
        for (const item of results) {
         
          const refProduct = await this.refProductRepository.findOne({
            where: { referenceCode: item.familia},
            relations: ['packings'],
          });

          if (refProduct) {
            // Verificar si ya existe un packing asociado a la referencia
            let packing = refProduct.packings && refProduct.packings.length > 0 ? refProduct.packings[0] : null;

            // Si no existe un packing, crear uno nuevo
            if (!packing) {
              packing = new Packing();
              packing.refProduct = refProduct;
            }

            // Actualizar los datos del packing
            packing.unities = item.empaque_unds_caja !== null && item.empaque_unds_caja !== undefined ? parseInt(item.empaque_unds_caja) : packing.unities;
            packing.large = item.empaque_largo !== null && item.empaque_largo !== undefined ? parseFloat(item.empaque_largo) : packing.large;
            packing.width = item.empaque_ancho !== null && item.empaque_ancho !== undefined ? parseFloat(item.empaque_ancho) : packing.width;
            packing.height = item.empaque_alto !== null && item.empaque_alto !== undefined ? parseFloat(item.empaque_alto) : packing.height;
            packing.smallPackingWeight = item.empaque_peso_neto !== null && item.empaque_peso_neto !== undefined ? parseFloat(item.empaque_peso_neto) : packing.smallPackingWeight;


            // Guardar o actualizar el packing asociado a la referencia
            const packingUpdate = await this.packingRepository.save(packing);
            console.log("--")
            console.log(packingUpdate)
          } else {
            console.log(`Referencia de producto con skuPadre ${item.skuPadre} no encontrada.`);
          }
        }


      } else {
        throw new Error('La API no devolvió una respuesta exitosa');
      }
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      throw new Error('Error al cargar los productos');
    }
  }




}
