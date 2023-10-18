import { IsString } from 'class-validator';

export class CreateSupplierPriceDto {
  @IsString()
  supplier: string;

  @IsString()
  product: string;

  @IsString()
  listPrice: string;
}