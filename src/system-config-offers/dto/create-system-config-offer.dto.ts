import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSystemConfigOfferDto {
  @IsString()
  initDate: Date;

  @IsString()
  finalDate: Date;  

  @IsString()
  @IsOptional()
  product?: string;
}