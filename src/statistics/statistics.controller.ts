import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('')
  getStatistics(

  ) {
    return this.statisticsService.getStatistics();
  }

  @Get('top/clients')
  getTop10ClientsWithMostPurchases(
    @Query('yearParam') yearParam: number,
  ) {
    return this.statisticsService.getTop10ClientsWithMostPurchases(yearParam);
  }
}