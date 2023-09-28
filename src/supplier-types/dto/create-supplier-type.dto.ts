import { IsString } from 'class-validator';

export class CreateSupplierTypeDto {
  @IsString()
  name: string;
}
