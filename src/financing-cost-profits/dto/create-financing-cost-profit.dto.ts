import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFinancingCostProfitDto {
  @IsInt()
  days: number;

  @IsInt()
  financingPercentage: number;

  @IsInt()
  minimumAllowedUtility: number;

  @IsString()
  systemConfig: string;
  
  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}