import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarkingTagServicesService } from './marking-tag-services.service';
import { CreateMarkingTagServiceDto } from './dto/create-marking-tag-service.dto';
import { UpdateMarkingTagServiceDto } from './dto/update-marking-tag-service.dto';

@Controller('marking-tag-services')
export class MarkingTagServicesController {
  constructor(private readonly markingTagServicesService: MarkingTagServicesService) {}

  @Post()
  create(@Body() createMarkingTagServiceDto: CreateMarkingTagServiceDto) {
    return this.markingTagServicesService.create(createMarkingTagServiceDto);
  }

  @Get()
  findAll() {
    return this.markingTagServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.markingTagServicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkingTagServiceDto: UpdateMarkingTagServiceDto) {
    return this.markingTagServicesService.update(+id, updateMarkingTagServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markingTagServicesService.remove(+id);
  }
}
