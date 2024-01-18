import { IsArray, IsDate, IsDecimal, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  supplierSku?: string;

  @IsOptional()
  @IsNumber()
  isAllowed?: number;

  @IsOptional()
  @IsInt()
  disccountPromo?: number;

  @IsOptional()
  @IsInt()
  entryDiscount?: number;

  @IsOptional()
  @IsString()
  tagSku?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  large?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  width?: number;

  @IsOptional()
  @IsString()
  importedNational?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  height?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  weight?: number;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsInt()
  registeredNewOrUpdated?: number;

  @IsOptional()
  @IsString()
  updateReason?: string;

  @IsInt()
  availableUnit?: number;

  @IsOptional()
  @IsInt()
  transitUnit?: number;

  @IsOptional()
  @IsString()
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

  @IsOptional()
  @IsInt()
  unforeseenFee?: number;
}