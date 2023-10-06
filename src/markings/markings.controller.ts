import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarkingsService } from './markings.service';
import { CreateMarkingDto } from './dto/create-marking.dto';
import { UpdateMarkingDto } from './dto/update-marking.dto';

@Controller('markings')
export class MarkingsController {
  constructor(private readonly markingsService: MarkingsService) {}

  @Post()
  create(@Body() createMarkingDto: CreateMarkingDto) {
    return this.markingsService.create(createMarkingDto);
  }

  @Get()
  findAll() {
    return this.markingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.markingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkingDto: UpdateMarkingDto) {
    return this.markingsService.update(+id, updateMarkingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markingsService.remove(+id);
  }
}
