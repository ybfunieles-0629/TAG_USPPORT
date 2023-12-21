import { IsDate, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsOptional()
  @IsString()
  tagOrderNumber: string;

  @IsString()
  clientOrderNumber: string;

  @IsString()
  orderDocument: string;

  @IsDate()
  approvalDate: Date;

  @IsDate()
  creationDate: Date;

  @IsDate()
  paymentDate: Date;

  @IsString()
  userApproval: string;

  @IsUUID()
  clientUser: string;
  
  @IsUUID()
  commercialUser: string;

  @IsDate()
  invoiceIssueDate: Date;

  @IsDate()
  expirationDate: Date;

  @IsInt()
  value: number;

  @IsDate()
  invoiceDueDate: Date;

  @IsInt()
  @Min(0)
  financingCost: number;

  @IsInt()
  @Min(0)
  feeCost: number;

  @IsInt()
  @Min(0)
  retentionCost: number;

  @IsInt()
  billingNumber: number;

  @IsString()
  billingFile: string;

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
}
