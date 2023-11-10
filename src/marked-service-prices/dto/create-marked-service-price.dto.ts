import { IsDate, IsDecimal, IsInt, IsString } from 'class-validator';

export class CreateMarkedServicePriceDto {
  @IsInt()
  minRange: number;

  @IsInt()
  maxRange: number;

  @IsDecimal()
  unitPrice: number;

  @IsDate()
  deliveryTime: Date;

  @IsString()
  markingServiceProperty: string;
}
