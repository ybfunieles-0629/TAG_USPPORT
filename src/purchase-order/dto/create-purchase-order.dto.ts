import { IsDate, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsOptional()
  @IsString()
  tagOrderNumber: string;



  @IsString()
  clientOrderNumber: string;

  @IsString()
  orderDocument: string;

  @IsString()
  approvalDate: Date;

  @IsString()
  creationDate: Date;

  @IsString()
  paymentDate: Date;

  @IsString()
  userApproval: string;

  @IsUUID()
  clientUser: string;
  
  @IsUUID()
  commercialUser: string;

  @IsString()
  invoiceIssueDate: Date;

  @IsString()
  expirationDate: Date;

  @IsOptional()
  @IsString()
  purchaseDate: Date;


  
  @IsString()
  value: number;

  @IsString()
  invoiceDueDate: Date;

  @IsString()
  @Min(0)
  financingCost: number;

  @IsString()
  @Min(0)
  feeCost: number;

  @IsString()
  @Min(0)
  retentionCost: number;

  @IsString()
  billingNumber: number;

  @IsString()
  billingFile: string;

  @IsString()
  @IsOptional()
  shippingGuide?: string;

  @IsString()
  @IsUUID()
  createdBy: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  updatedBy?: string;

  @IsString()
  commercialQualification: string;

  @IsString()
  state: string;



  
  @IsOptional()
  @IsString()
  newBalance: number;

  
  @IsOptional()
  @IsString()
  costValue: number;

  
  @IsOptional()
  @IsString()
  orderClientNumber: string;


}
