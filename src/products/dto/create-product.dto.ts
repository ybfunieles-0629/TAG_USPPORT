import { IsArray, IsBoolean, IsDate, IsDecimal, IsInt, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  supplierSku: string;

  @IsString()
  tagSku: string;

  @IsInt()
  large: number;

  @IsDecimal()
  width: number;

  @IsDecimal()
  height: number;

  @IsDecimal()
  weight: number;

  @IsDecimal()
  availableUnit: number;

  @IsDecimal()
  transitUnit: number;

  @IsDate()
  productArrivalDate: Date;

  @IsBoolean()
  freeSample: boolean;

  @IsBoolean()
  requiredSample: boolean;

  @IsBoolean()
  loanSample: boolean;

  @IsDecimal()
  refundSampleTime: number;

  @IsDecimal()
  iva: number;

  @IsDecimal()
  tagDisccount: number;

  @IsDecimal()
  promoDisccount: number;

  @IsDecimal()
  hasNetPrice: number;

  @IsDecimal()
  samplePrice: number;

  @IsDecimal()
  referencePrice: number;

  @IsString()
  tariffItem: string;

  @IsString()
  refProduct: string;
}