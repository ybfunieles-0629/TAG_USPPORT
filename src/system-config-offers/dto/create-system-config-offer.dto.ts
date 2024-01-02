import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSystemConfigOfferDto {
  @IsInt()
  offerPercentage: number;

  @IsDate()
  initDate: Date;

  @IsDate()
  finalDate: Date;  

  @IsString()
  @IsOptional()
  product?: string;
}