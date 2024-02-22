import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { StatusHistoryService } from './status-history.service';
import { CreateStatusHistoryDto } from './dto/create-status-history.dto';
import { UpdateStatusHistoryDto } from './dto/update-status-history.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('status-history')
export class StatusHistoryController {
  constructor(private readonly statusHistoryService: StatusHistoryService) { }

  @Post()
  create(@Body() createStatusHistoryDto: CreateStatusHistoryDto) {
    return this.statusHistoryService.create(createStatusHistoryDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.statusHistoryService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.statusHistoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStatusHistoryDto: UpdateStatusHistoryDto) {
    return this.statusHistoryService.update(+id, updateStatusHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statusHistoryService.remove(+id);
  }
}
