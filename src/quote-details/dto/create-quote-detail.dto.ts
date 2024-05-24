import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, isInt } from 'class-validator';

export class CreateQuoteDetailDto {
  @IsInt()
  quantities: number;

  @IsOptional()
  @IsInt()
  additionalDiscount?: number;

  @IsInt()
  unitPrice: number;

  @IsInt()
  @IsOptional()
  totalCostoProduccion: number;

  @IsInt()
  @IsOptional()
  totalCostoProduccionSinIva: number;
  
  @IsInt()
  @IsOptional()
  iva: number;

  @IsInt()
  @IsOptional()
  discount: number;

  @IsOptional()
  @IsInt()
  sampleTransportValue?: number;

  @IsInt()
  totalPriceWithTransport: number;

  @IsInt()
  transportServiceTagClient: number;

  @IsInt()
  negotiationDiscount: number;

  @IsString()
  cartQuote: string;

  @IsBoolean()
  hasSample: boolean;

  @IsString()
  product: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  markingServices?: string[];
  
  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;


  @IsOptional()
  @IsInt()
  markingTotalPrice?: number;
  @IsOptional()
  @IsInt()
  markingPriceWithIva?: number;
  @IsOptional()
  @IsInt()
  markingPriceWith4x1000?: number;
  @IsOptional()
  @IsInt()
  markingWithProductSupplierTransport?: number;
  @IsOptional()
  @IsInt()
  aditionalClientFee?: number;

  @IsOptional()
  @IsInt()
  total?: number;
  @IsOptional()
  @IsInt()
  financingCost?: number;
  @IsOptional()
  @IsInt()
  discountPercentage?: number;
  @IsOptional()
  @IsInt()
  businessMarginProfit?: number;



  @IsOptional()
  @IsInt()
  totalGasto?: number;
  @IsOptional()
  @IsInt()
  totalIngresos?: number;
  @IsOptional()
  @IsInt()
  rentabilidadMininaEsperada?: number;
  @IsOptional()
  @IsInt()
  descuentoSugerido?: number;
  @IsOptional()
  @IsInt()
  UtilidadFinal?: number;
  @IsOptional()
  @IsInt()
  porcentajeUtilidadFinal?: number;



  @IsOptional()
  @IsInt()
  hasIva: number;


}