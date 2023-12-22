import { IsInt, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateShippingGuideDto {
  @IsString()
  guideCode: string;

  @IsString()
  url: string;

  @IsString()
  boxQuantities: number;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  updatedBy?: string;
}