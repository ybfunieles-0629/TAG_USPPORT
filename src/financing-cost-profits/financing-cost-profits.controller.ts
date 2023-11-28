import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { FinancingCostProfitsService } from './financing-cost-profits.service';
import { CreateFinancingCostProfitDto } from './dto/create-financing-cost-profit.dto';
import { UpdateFinancingCostProfitDto } from './dto/update-financing-cost-profit.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('financing-cost-profits')
export class FinancingCostProfitsController {
  constructor(private readonly financingCostProfitsService: FinancingCostProfitsService) { }

  @Post()
  create(
    @Body() createFinancingCostProfitDto: CreateFinancingCostProfitDto
  ) {
    return this.financingCostProfitsService.create(createFinancingCostProfitDto);
  }

  @Post('create/multiple')
  createMultiple(
    @Body() createFinancingCostProfits: CreateFinancingCostProfitDto[]
  ) {
    return this.financingCostProfitsService.createMultiple(createFinancingCostProfits);
  }

  @Get()
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.financingCostProfitsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.financingCostProfitsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFinancingCostProfitDto: UpdateFinancingCostProfitDto
  ) {
    return this.financingCostProfitsService.update(id, updateFinancingCostProfitDto);
  }

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.financingCostProfitsService.desactivate(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.financingCostProfitsService.remove(id);
  }
}
