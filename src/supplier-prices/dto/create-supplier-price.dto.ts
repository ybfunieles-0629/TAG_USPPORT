import { IsArray, IsString } from 'class-validator';

export class CreateSupplierPriceDto {
  @IsString()
  supplier: string;

  @IsString()
  product: string;

  @IsArray()
  @IsString({ each: true })
  listPrices?: string[];
}