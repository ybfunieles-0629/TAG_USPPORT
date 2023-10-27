import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateDeliveryTimeDto {
  @IsNumber()
  minimum: number;

  @IsNumber()
  maximum: number;

  @IsNumber()
  timeInDays: number;

  @IsNumber()
  minimumAdvanceValue: number;
}