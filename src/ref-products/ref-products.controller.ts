import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RefProductsService } from './ref-products.service';
import { CreateRefProductDto } from './dto/create-ref-product.dto';
import { UpdateRefProductDto } from './dto/update-ref-product.dto';

@Controller('ref-products')
export class RefProductsController {
  constructor(private readonly refProductsService: RefProductsService) {}

  @Post()
  create(@Body() createRefProductDto: CreateRefProductDto) {
    return this.refProductsService.create(createRefProductDto);
  }

  @Get()
  findAll() {
    return this.refProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.refProductsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRefProductDto: UpdateRefProductDto) {
    return this.refProductsService.update(+id, updateRefProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.refProductsService.remove(+id);
  }
}
