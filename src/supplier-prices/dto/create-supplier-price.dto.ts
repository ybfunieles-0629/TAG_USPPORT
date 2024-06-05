import { IsArray, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSupplierPriceDto {
  @IsString()
  supplier: string;

  @IsString()
  product: string;

  @IsArray()
  @IsString({ each: true })
  listPrices?: string[];


  @IsOptional()
  @IsString()
  refProduct: string;

  @IsOptional()
  @IsBoolean()
  allProducts: boolean;

  
}