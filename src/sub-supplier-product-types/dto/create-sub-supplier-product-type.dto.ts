import { IsString } from 'class-validator';

export class CreateSubSupplierProductTypeDto {
  @IsString()
  name: string;
}
