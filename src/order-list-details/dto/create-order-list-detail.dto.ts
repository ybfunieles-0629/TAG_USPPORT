import { IsArray, IsDate, IsInt, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrderListDetailDto {
  @IsOptional()
  @IsString()
  orderCode?: string;

  @IsOptional()
  @IsString()
  orderCodeClient?: string;

  @IsInt()
  quantities: number;

  @IsInt()
  productTotalPrice: number;

  @IsString()
  clientTagTransportService: string;

  @IsOptional()
  @IsInt()
  estimatedProfit: number;

  @IsOptional()
  @IsInt()
  realProfit: number;

  @IsString()
  secondaryState: string;

  @IsOptional()
  @IsDate()
  estimatedMarketDate: Date;

  @IsOptional()
  @IsDate()
  estimatedDeliveryDate: Date;

  @IsOptional()
  @IsDate()
  expirationDate: Date;

  @IsOptional()
  @IsString()
  deliveryProofDocument: string;

  @IsInt()
  realCost: number;

  @IsOptional()
  @IsInt()
  estimatedQuoteCost: number;

  @IsString()
  costNote: string;

  @IsInt()
  tagProductTotalCost: number;

  @IsInt()
  samplePrice: number;

  @IsInt()
  tagMarkingTotalCost: number;

  @IsInt()
  transportCost: number;

  @IsInt()
  realTransportCost: number;

  @IsInt()
  realMarkingCost: number;

  @IsInt()
  otherRealCosts: number;

  @IsString()
  @IsUUID()
  orderRating: string;

  @IsString()
  @IsUUID()
  purchaseOrder: string;

  @IsArray()
  @IsString({ each: true })
  markingServices: string[];

  @IsString()
  @IsUUID()
  transportService: string;

  @IsString()
  @IsUUID()
  state: string;

  @IsString()
  @IsUUID()
  product: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;
}