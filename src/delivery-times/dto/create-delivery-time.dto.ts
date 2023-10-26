import { IsNumber, IsString } from 'class-validator';

export class CreateDeliveryTimeDto {
  @IsNumber()
  minimun: number;

  @IsNumber()
  maximum: number;

  @IsNumber()
  timeInDays: number;

  @IsNumber()
  minimunAdvanceValue: number;

  @IsString()
  refProduct: string;
}