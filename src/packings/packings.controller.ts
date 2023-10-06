import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PackingsService } from './packings.service';
import { CreatePackingDto } from './dto/create-packing.dto';
import { UpdatePackingDto } from './dto/update-packing.dto';

@Controller('packings')
export class PackingsController {
  constructor(private readonly packingsService: PackingsService) {}

  @Post()
  create(@Body() createPackingDto: CreatePackingDto) {
    return this.packingsService.create(createPackingDto);
  }

  @Get()
  findAll() {
    return this.packingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackingDto: UpdatePackingDto) {
    return this.packingsService.update(+id, updatePackingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packingsService.remove(+id);
  }
}
