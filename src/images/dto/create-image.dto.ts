import { IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  url: string;

  @IsString()
  refProduct: string;
}