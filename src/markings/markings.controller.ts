import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { MarkingsService } from './markings.service';
import { CreateMarkingDto } from './dto/create-marking.dto';
import { UpdateMarkingDto } from './dto/update-marking.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('markings')
export class MarkingsController {
  constructor(private readonly markingsService: MarkingsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createMarkingDto: CreateMarkingDto) {
    return this.markingsService.create(createMarkingDto);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createMultipleMarkings: CreateMarkingDto[]
  ) {
    return this.markingsService.createMultiple(createMultipleMarkings);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.markingsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkingDto: UpdateMarkingDto
  ) {
    return this.markingsService.update(id, updateMarkingDto);
  }

  @Put('/update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateMultipleMarkings: UpdateMarkingDto[]
  ) {
    return this.markingsService.updateMultiple(updateMultipleMarkings);
  }


  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.markingsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.markingsService.remove(id);
  }
}
