import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMarketDesignAreaDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsNumber()
  large: number;

  @IsNumber()
  width: number;
}
