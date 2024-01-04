import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { ShippingGuidesService } from './shipping-guides.service';
import { CreateShippingGuideDto } from './dto/create-shipping-guide.dto';
import { UpdateShippingGuideDto } from './dto/update-shipping-guide.dto';

@Controller('shipping-guides')
export class ShippingGuidesController {
  constructor(private readonly shippingGuidesService: ShippingGuidesService) { }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('deliveryProof'))
  create(
    @Body() createShippingGuideDto: CreateShippingGuideDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.shippingGuidesService.create(createShippingGuideDto, file);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll() {
    return this.shippingGuidesService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id') id: string) {
    return this.shippingGuidesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(@Param('id') id: string, @Body() updateShippingGuideDto: UpdateShippingGuideDto) {
    return this.shippingGuidesService.update(+id, updateShippingGuideDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string) {
    return this.shippingGuidesService.remove(+id);
  }
}
