import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateMarketDesignAreaDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  large: number;

  @IsString()
  width: string;
}
