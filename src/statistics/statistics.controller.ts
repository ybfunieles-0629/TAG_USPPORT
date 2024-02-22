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

  @Get('utility')
  getStatsForYear(
    @Query('startYear') startYear: number,
    @Query('endYear') endYear: number,
  ) {
    return this.statisticsService.getStatsForYears(startYear, endYear);
  }

  @Get('commercials/report')
  getCommercialReportsForYear(
    @Query('yearParam') yearParam: number,
  ) {
    return this.statisticsService.getCommercialReportsForYear(yearParam);
  };

  @Get('categories/report')
  getCategoryReportsForYear(
    @Query('yearParam') yearParam: number,
  ) {
    return this.statisticsService.getCategoryReportsForYear(yearParam);
  };

  @Get('commercial/stats')
  getCommercialQualificationStatsByMonth(
    @Query('year') year: number,
    @Query('commercial') commercial: string,
  ) {
    return this.statisticsService.getCommercialQualificationStatsByMonth(year, commercial);
  }

  @Get('clients/stats')
  getOrderRatingStatsByMonth(
    @Query('year') year: number,
    @Query('client') client: string,
  ) {
    return this.statisticsService.getOrderRatingStatsByMonth(year, client);
  }
}