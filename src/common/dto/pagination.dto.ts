import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  calculations?: number;

  @IsOptional()
  supplier?: number;

  @IsOptional()
  isAllowed?: number;

  @IsOptional()
  isCommercial?: number;

  @IsOptional()
  dashboard?: number;
  
  @IsOptional()
  margin?: number;

  @IsOptional()
  clientId?: string;
}