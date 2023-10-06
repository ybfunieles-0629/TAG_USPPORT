import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarkingServicePropertiesService } from './marking-service-properties.service';
import { CreateMarkingServicePropertyDto } from './dto/create-marking-service-property.dto';
import { UpdateMarkingServicePropertyDto } from './dto/update-marking-service-property.dto';

@Controller('marking-service-properties')
export class MarkingServicePropertiesController {
  constructor(private readonly markingServicePropertiesService: MarkingServicePropertiesService) {}

  @Post()
  create(@Body() createMarkingServicePropertyDto: CreateMarkingServicePropertyDto) {
    return this.markingServicePropertiesService.create(createMarkingServicePropertyDto);
  }

  @Get()
  findAll() {
    return this.markingServicePropertiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.markingServicePropertiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkingServicePropertyDto: UpdateMarkingServicePropertyDto) {
    return this.markingServicePropertiesService.update(+id, updateMarkingServicePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markingServicePropertiesService.remove(+id);
  }
}
