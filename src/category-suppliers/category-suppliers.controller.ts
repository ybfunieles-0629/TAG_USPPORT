import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategorySuppliersService } from './category-suppliers.service';
import { CreateCategorySupplierDto } from './dto/create-category-supplier.dto';
import { UpdateCategorySupplierDto } from './dto/update-category-supplier.dto';

@Controller('category-suppliers')
export class CategorySuppliersController {
  constructor(private readonly categorySuppliersService: CategorySuppliersService) {}

  @Post()
  create(@Body() createCategorySupplierDto: CreateCategorySupplierDto) {
    return this.categorySuppliersService.create(createCategorySupplierDto);
  }

  @Get()
  findAll() {
    return this.categorySuppliersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categorySuppliersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategorySupplierDto: UpdateCategorySupplierDto) {
    return this.categorySuppliersService.update(+id, updateCategorySupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categorySuppliersService.remove(+id);
  }
}
