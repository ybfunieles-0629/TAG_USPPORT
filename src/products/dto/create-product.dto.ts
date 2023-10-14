import { IsArray, IsDate, IsInt, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  supplierSku: string;

  @IsString()
  tagSku: string;

  @IsInt()
  large: number;

  @IsInt()
  width: number;

  @IsInt()
  height: number;

  @IsInt()
  weight: number;

  @IsInt()
  availableUnit: number;

  @IsInt()
  transitUnit: number;

  @IsDate()
  productArrivalDate: Date;

  @IsInt()
  freeSample: number;

  @IsInt()
  requiredSample: number;

  @IsInt()
  loanSample: number;

  @IsInt()
  refundSampleTime: number;

  @IsInt()
  iva: number;

  @IsInt()
  tagDisccount: number;

  @IsInt()
  promoDisccount: number;

  @IsInt()
  hasNetPrice: number;

  @IsInt()
  samplePrice: number;

  @IsInt()
  referencePrice: number;

  @IsString()
  tariffItem: string;

  @IsString()
  refProduct: string;
}