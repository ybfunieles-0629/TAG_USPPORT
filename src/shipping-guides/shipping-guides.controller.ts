import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ShippingGuidesService } from './shipping-guides.service';
import { CreateShippingGuideDto } from './dto/create-shipping-guide.dto';
import { UpdateShippingGuideDto } from './dto/update-shipping-guide.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('shipping-guides')
export class ShippingGuidesController {
  constructor(private readonly shippingGuidesService: ShippingGuidesService) { }

  @Post()
  @UseInterceptors(FileInterceptor('deliveryProof'))
  create(
    @Body() createShippingGuideDto: CreateShippingGuideDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.shippingGuidesService.create(createShippingGuideDto, file);
  }

  @Get()
  findAll() {
    return this.shippingGuidesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingGuidesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShippingGuideDto: UpdateShippingGuideDto) {
    return this.shippingGuidesService.update(+id, updateShippingGuideDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingGuidesService.remove(+id);
  }
}
