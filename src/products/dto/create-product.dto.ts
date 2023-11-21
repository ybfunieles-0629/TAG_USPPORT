import { IsArray, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  supplierSku?: string;

  @IsOptional()
  @IsString()
  tagSku?: string;

  @IsOptional()
  @IsInt()
  large?: number;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsString()
  importedNational?: string;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsInt()
  availableUnit?: number;

  @IsOptional()
  @IsInt()
  transitUnit?: number;

  @IsOptional()
  @IsDate()
  productArrivalDate?: Date;

  @IsOptional()
  @IsInt()
  freeSample?: number;

  @IsOptional()
  @IsInt()
  requiredSample?: number;

  @IsOptional()
  @IsInt()
  loanSample?: number;

  @IsOptional()
  @IsInt()
  refundSampleTime?: number;

  @IsOptional()
  @IsInt()
  iva?: number;

  @IsOptional()
  @IsInt()
  tagDisccount?: number;

  @IsOptional()
  @IsInt()
  promoDisccount?: number;

  @IsOptional()
  @IsInt()
  hasNetPrice?: number;

  @IsOptional()
  @IsInt()
  samplePrice?: number;

  @IsOptional()
  @IsInt()
  referencePrice?: number;

  @IsOptional()
  @IsDate()
  lastPriceUpdateDate?: Date;

  @IsOptional()
  @IsString()
  tariffItem?: string;

  @IsOptional()
  @IsString()
  refProduct?: string;

  @IsOptional()
  @IsString()
  markedDesignArea?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variantReferences?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  markingServiceProperties?: string[];
}