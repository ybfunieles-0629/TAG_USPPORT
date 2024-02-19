import { IsOptional, IsString } from "class-validator";

export class CreateSwiperHomeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  // @IsString()
  // imageUrl: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  location?: string;
}