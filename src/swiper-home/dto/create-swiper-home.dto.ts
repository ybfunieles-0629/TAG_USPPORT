import { IsString } from "class-validator";

export class CreateSwiperHomeDto {
  @IsString()
  title: string;

  @IsString()
  subtitle: string;

  @IsString()
  imageUrl: string;

  @IsString()
  url: string;

  @IsString()
  location: string;
}