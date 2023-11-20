import { IsDate, IsInt, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrderListDetailDto {
  @IsString()
  orderCode: string;

  @IsInt()
  quantities: number;

  @IsInt()
  productTotalPrice: number;

  @IsString()
  clientTagTransportService: string;

  @IsInt()
  estimatedProfit: number;

  @IsInt()
  realProfit: number;

  @IsString()
  secondaryState: string;

  @IsDate()
  estimatedMarketDate: Date;

  @IsDate()
  estimatedDeliveryDate: Date;

  @IsString()
  deliveryProofDocument: string;

  @IsInt()
  realCost: number;

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

  @IsString()
  @IsUUID()
  markingService: string;

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