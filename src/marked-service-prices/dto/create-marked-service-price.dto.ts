import { IsDate, IsDecimal, IsInt, IsString } from 'class-validator';

export class CreateMarkedServicePriceDto {
  @IsString()
  markedServiceTagTechnique: string;

  @IsString()
  subTechnique: string;

  @IsString()
  markedServiceSubTagTechnique: string;

  @IsInt()
  minRange: number;

  @IsInt()
  maxRange: number;

  @IsInt()
  maxLarge: number;

  @IsInt()
  maxWidth: number;

  @IsString()
  property: string;

  @IsDecimal()
  unitPrice: number;

  @IsDate()
  deliveryTime: Date;

  @IsString()
  markingServiceProperty: string;
}
