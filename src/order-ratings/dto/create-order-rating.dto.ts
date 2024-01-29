import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderRatingDto {
  @IsInt()
  deliveryTime: number;

  @IsInt()
  packingQuality: number;

  @IsInt()
  productQuality: number;

  @IsInt()
  markingQuality: number;

  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}