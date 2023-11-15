import { IsString } from 'class-validator';

export class CreateFinancingCostProfitDto {
  @IsString()
  systemConfig: string;
}