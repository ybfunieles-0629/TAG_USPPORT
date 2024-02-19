import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { FinancingCostProfitsService } from './financing-cost-profits.service';
import { CreateFinancingCostProfitDto } from './dto/create-financing-cost-profit.dto';
import { UpdateFinancingCostProfitDto } from './dto/update-financing-cost-profit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('financing-cost-profits')
export class FinancingCostProfitsController {
  constructor(private readonly financingCostProfitsService: FinancingCostProfitsService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createFinancingCostProfitDto: CreateFinancingCostProfitDto,
    @GetUser() user: User,
  ) {
    return this.financingCostProfitsService.create(createFinancingCostProfitDto, user);
  }

  @Post('create/multiple')
  @UseGuards(AuthGuard())
  createMultiple(
    @Body() createFinancingCostProfits: CreateFinancingCostProfitDto[],
    @GetUser() user: User,
  ) {
    return this.financingCostProfitsService.createMultiple(createFinancingCostProfits, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Param() paginationDto: PaginationDto
  ) {
    return this.financingCostProfitsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.financingCostProfitsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFinancingCostProfitDto: UpdateFinancingCostProfitDto,
    @GetUser() user: User,
  ) {
    return this.financingCostProfitsService.update(id, updateFinancingCostProfitDto, user);
  }

  @Patch('update/multiple')
  @UseGuards(AuthGuard())
  updateMultiple(
    @Body() updateFinancingCostProfits: UpdateFinancingCostProfitDto[],
    @GetUser() user: User,
  ) {
    return this.financingCostProfitsService.updateMultiple(updateFinancingCostProfits, user);
  }

  @Patch('desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.financingCostProfitsService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.financingCostProfitsService.remove(id);
  }
}
