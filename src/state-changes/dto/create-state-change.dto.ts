import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStateChangeDto {
  @IsString()
  state: string;

  @IsDate()
  date: Date;

  @IsString()
  supplierPurchaseOrder: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}