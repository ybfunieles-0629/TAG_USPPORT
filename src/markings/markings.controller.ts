import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { MarkingsService } from './markings.service';
import { CreateMarkingDto } from './dto/create-marking.dto';
import { UpdateMarkingDto } from './dto/update-marking.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('markings')
export class MarkingsController {
  constructor(private readonly markingsService: MarkingsService) { }

  @Post()
  create(@Body() createMarkingDto: CreateMarkingDto) {
    return this.markingsService.create(createMarkingDto);
  }

  @Post('create/multiple')
  createMultiple(
    @Body() createMultipleMarkings: CreateMarkingDto[]
  ) {
    return this.markingsService.createMultiple(createMultipleMarkings);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.markingsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingDto: UpdateMarkingDto
  ) {
    return this.markingsService.update(id, updateMarkingDto);
  }

  @Patch('/update/multiple')
  updateMultiple(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMultipleMarkings: UpdateMarkingDto[]
  ) {
    return this.markingsService.updateMultiple(updateMultipleMarkings);
  }


  @Patch('/desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingsService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingsService.remove(id);
  }
}
